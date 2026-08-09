import { query, isConnected } from '../config/db.js';
import { mockStore } from '../db/mockStore.js';
import { calculateRoute } from '../services/routingService.js';

export async function matchTriage(req, res) {
  try {
    const {
      victim_lat,
      victim_lon,
      location_description = '',
      symptoms = '',
      asv_vials_needed = 10,
      requires_ventilator = false
    } = req.body;

    if (!victim_lat || !victim_lon) {
      return res.status(400).json({ success: false, error: 'Victim latitude and longitude coordinates are required' });
    }

    const lat = parseFloat(victim_lat);
    const lon = parseFloat(victim_lon);
    const neededVials = parseInt(asv_vials_needed, 10);
    const needsVentilator = Boolean(requires_ventilator);

    // 1. Fetch hospitals & ambulances
    let hospitals = [];
    let ambulances = [];

    if (isConnected) {
      hospitals = await query('SELECT * FROM hospitals WHERE current_asv_vials > 0');
      ambulances = await query('SELECT * FROM ambulances WHERE status = "available"');
    } else {
      hospitals = mockStore.hospitals.filter(h => h.current_asv_vials > 0);
      ambulances = mockStore.ambulances.filter(a => a.status === 'available');
    }

    if (hospitals.length === 0) {
      return res.status(404).json({ success: false, error: 'NO_EQUIPPED_HOSPITALS', message: 'No hospitals with active ASV stock currently available.' });
    }

    // 2. Compute routing for all hospitals
    const ratedHospitals = await Promise.all(
      hospitals.map(async (h) => {
        const route = await calculateRoute(lat, lon, h.latitude, h.longitude);
        const hasAdequateAsv = h.current_asv_vials >= neededVials;
        const satisfiesVentilator = needsVentilator ? Boolean(h.ventilator_available) : true;
        
        // Match score priority: Ventilator match > ASV stock adequate > lowest ETA
        let suitabilityScore = 100;
        if (!satisfiesVentilator) suitabilityScore -= 50;
        if (!hasAdequateAsv) suitabilityScore -= 30;
        suitabilityScore -= route.duration_minutes;

        return {
          ...h,
          distance_km: route.distance_km,
          eta_minutes: route.duration_minutes,
          engine: route.engine,
          fallback_used: route.fallback_used,
          has_adequate_asv: hasAdequateAsv,
          satisfies_ventilator: satisfiesVentilator,
          suitability_score: suitabilityScore
        };
      })
    );

    // Sort by suitability score descending (best match first)
    ratedHospitals.sort((a, b) => b.suitability_score - a.suitability_score);

    // 3. Compute routing for available ambulances to victim
    let matchedAmbulance = null;
    if (ambulances.length > 0) {
      const ratedAmbulances = await Promise.all(
        ambulances.map(async (a) => {
          const route = await calculateRoute(a.current_lat, a.current_lon, lat, lon);
          return {
            ...a,
            distance_to_victim_km: route.distance_km,
            eta_to_victim_minutes: route.duration_minutes,
            engine: route.engine
          };
        })
      );
      ratedAmbulances.sort((a, b) => a.eta_to_victim_minutes - b.eta_to_victim_minutes);
      matchedAmbulance = ratedAmbulances[0];
    } else {
      // Fallback dummy ambulance if all dispatched
      matchedAmbulance = {
        id: 99,
        vehicle_number: 'AMB-EMERGENCY-DIRECT',
        status: 'standby',
        driver_name: 'Regional Helpline Dispatch',
        driver_phone: '15400',
        eta_to_victim_minutes: 15
      };
    }

    const primaryHospital = ratedHospitals[0];
    const totalEta = (matchedAmbulance.eta_to_victim_minutes || 15) + primaryHospital.eta_minutes;

    return res.json({
      success: true,
      data: {
        matched_hospital: primaryHospital,
        matched_ambulance: matchedAmbulance,
        total_estimated_eta_minutes: totalEta,
        candidate_hospitals: ratedHospitals,
        triage_meta: {
          victim_lat: lat,
          victim_lon: lon,
          location_description,
          symptoms,
          asv_vials_requested: neededVials,
          requires_ventilator: needsVentilator
        }
      }
    });

  } catch (error) {
    console.error('Triage matching error:', error);
    return res.status(500).json({ success: false, error: 'Failed to compute emergency triage routing matrix' });
  }
}
