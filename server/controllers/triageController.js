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

    // 1. Fetch hospitals & ambulances (excluding SPECIALTY_EXCLUDED)
    let hospitals = [];
    let ambulances = [];

    if (isConnected) {
      hospitals = await query('SELECT * FROM hospitals WHERE (facility_category IS NULL OR facility_category != "SPECIALTY_EXCLUDED") AND is_open = 1 AND accepting_patients = 1');
      ambulances = await query('SELECT * FROM ambulances WHERE status = "available"');
    } else {
      hospitals = mockStore.hospitals.filter(h => h.facility_category !== 'SPECIALTY_EXCLUDED' && (h.is_open === undefined || h.is_open === 1) && (h.accepting_patients === undefined || h.accepting_patients === 1));
      ambulances = mockStore.ambulances.filter(a => a.status === 'available');
    }

    if (hospitals.length === 0) {
      return res.status(404).json({ success: false, error: 'NO_EQUIPPED_HOSPITALS', message: 'No active, open emergency facilities available.' });
    }

    // Helper: evaluate current local time against hospital operating hours
    const now = new Date();
    const currentHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // 2. Compute routing & suitability for all candidate hospitals
    const ratedHospitals = await Promise.all(
      hospitals.map(async (h) => {
        const route = await calculateRoute(lat, lon, h.latitude, h.longitude);
        const isPhc = h.facility_category === 'UNREGISTERED_PHC';
        const effectiveAsvVials = isPhc ? 0 : (h.current_asv_vials || 0);
        const hasAdequateAsv = effectiveAsvVials >= neededVials;
        const satisfiesVentilator = needsVentilator ? Boolean(h.ventilator_available) : true;
        
        let isOpenNow = true;
        if (h.is_24_7 === 0 && h.opening_time && h.closing_time) {
          const openTime = h.opening_time.substring(0, 5);
          const closeTime = h.closing_time.substring(0, 5);
          if (currentHHMM < openTime || currentHHMM > closeTime) {
            isOpenNow = false;
          }
        }

        // Match score priority: Category > Is Open > Ventilator match > ASV stock adequate > lowest ETA
        let suitabilityScore = 100;
        if (!isOpenNow) suitabilityScore -= 100;
        if (!satisfiesVentilator) suitabilityScore -= 50;
        if (!hasAdequateAsv) suitabilityScore -= 30;

        // Unregistered PHC Penalization (surfaces only in worst-case emergencies)
        if (isPhc) {
          suitabilityScore -= 120; // Default penalty: lower preference than Tier 1/2
        }

        suitabilityScore -= route.duration_minutes;

        return {
          ...h,
          current_asv_vials: effectiveAsvVials,
          distance_km: route.distance_km,
          eta_minutes: route.duration_minutes,
          engine: route.engine,
          fallback_used: route.fallback_used,
          has_adequate_asv: hasAdequateAsv,
          satisfies_ventilator: satisfiesVentilator,
          is_currently_open: isOpenNow,
          is_first_aid_only: isPhc,
          suitability_score: suitabilityScore
        };
      })
    );

    // Sort by suitability score descending
    ratedHospitals.sort((a, b) => b.suitability_score - a.suitability_score);

    // Worst-Case Check: If no Tier 1 hospital has ETA <= 40 mins OR no ambulance available, but a PHC is < 15 mins away
    const hasTier1Available = ratedHospitals.some(h => !h.is_first_aid_only && h.is_currently_open && h.eta_minutes <= 40);
    const availableAmbulanceCount = ambulances.length;

    if ((!hasTier1Available || availableAmbulanceCount === 0)) {
      const nearestPhc = ratedHospitals.find(h => h.is_first_aid_only && h.is_currently_open && h.eta_minutes <= 15);
      if (nearestPhc) {
        nearestPhc.suitability_score += 200; // Boost PHC to #1 position for worst-case first aid stop
        nearestPhc.worst_case_first_aid_trigger = true;
        ratedHospitals.sort((a, b) => b.suitability_score - a.suitability_score);
      }
    }

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
