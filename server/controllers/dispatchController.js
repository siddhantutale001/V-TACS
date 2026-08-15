import { pool, query, isConnected } from '../config/db.js';
import { mockStore } from '../db/mockStore.js';

export async function executeDispatch(req, res) {
  const {
    victim_lat,
    victim_lon,
    location_description = '',
    symptoms = 'Snakebite envenoming case',
    bite_time = null,
    hospital_id,
    ambulance_id,
    estimated_eta,
    asv_vials_reserved = 10
  } = req.body;

  if (!hospital_id || !victim_lat || !victim_lon) {
    return res.status(400).json({ success: false, error: 'Missing required dispatch parameters (hospital_id, victim coordinates)' });
  }

  const hId = parseInt(hospital_id, 10);
  const aId = ambulance_id ? parseInt(ambulance_id, 10) : null;
  const vialsToReserve = parseInt(asv_vials_reserved, 10) || 10;

  if (isConnected && pool) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // 1. Check & Decrement ASV stock atomically
      const [hospitals] = await conn.execute('SELECT id, name, current_asv_vials FROM hospitals WHERE id = ? FOR UPDATE', [hId]);
      if (hospitals.length === 0) {
        await conn.rollback();
        conn.release();
        return res.status(404).json({ success: false, error: 'Hospital not found' });
      }

      const hospital = hospitals[0];
      if (hospital.current_asv_vials < vialsToReserve) {
        await conn.rollback();
        conn.release();
        return res.status(400).json({
          success: false,
          error: 'INSUFFICIENT_ASV_STOCK',
          message: `Hospital ${hospital.name} only has ${hospital.current_asv_vials} ASV vials remaining.`
        });
      }

      const newAsvCount = hospital.current_asv_vials - vialsToReserve;
      await conn.execute('UPDATE hospitals SET current_asv_vials = ? WHERE id = ?', [newAsvCount, hId]);

      // 2. Mark ambulance dispatched if specified
      if (aId) {
        await conn.execute('UPDATE ambulances SET status = "dispatched" WHERE id = ?', [aId]);
      }

      // 3. Create active case record
      const [caseResult] = await conn.execute(
        `INSERT INTO active_cases 
         (victim_lat, victim_lon, location_description, symptoms, bite_time, assigned_hospital_id, assigned_ambulance_id, estimated_eta, asv_vials_reserved, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, "dispatched")`,
        [
          victim_lat,
          victim_lon,
          location_description,
          symptoms,
          bite_time || new Date(),
          hId,
          aId,
          estimated_eta || 20,
          vialsToReserve
        ]
      );

      await conn.commit();
      conn.release();

      console.log(`[DISPATCH SUCCESS] Reserved ${vialsToReserve} ASV vials at ${hospital.name}. Active Case #${caseResult.insertId} created.`);

      return res.json({
        success: true,
        message: 'EMERGENCY DISPATCH EXECUTED & ASV RESERVED',
        case_id: caseResult.insertId,
        asv_vials_reserved: vialsToReserve,
        remaining_asv_vials: newAsvCount,
        hospital_name: hospital.name
      });
    } catch (error) {
      await conn.rollback();
      conn.release();
      console.error('Dispatch transaction failed:', error);
      return res.status(500).json({ success: false, error: 'Failed to execute dispatch transaction' });
    }
  } else {
    // In-memory transaction fallback
    const hospital = mockStore.hospitals.find(h => h.id === hId);
    if (!hospital) {
      return res.status(404).json({ success: false, error: 'Hospital not found' });
    }

    if (hospital.current_asv_vials < vialsToReserve) {
      return res.status(400).json({
        success: false,
        error: 'INSUFFICIENT_ASV_STOCK',
        message: `Hospital ${hospital.name} only has ${hospital.current_asv_vials} ASV vials remaining.`
      });
    }

    hospital.current_asv_vials -= vialsToReserve;

    if (aId) {
      const amb = mockStore.ambulances.find(a => a.id === aId);
      if (amb) amb.status = 'dispatched';
    }

    const newCaseId = mockStore.active_cases.length + 101;
    const newCase = {
      id: newCaseId,
      victim_lat,
      victim_lon,
      location_description,
      symptoms,
      bite_time: bite_time || new Date().toISOString(),
      assigned_hospital_id: hId,
      assigned_hospital_name: hospital.name,
      assigned_ambulance_id: aId,
      assigned_ambulance_number: aId ? `MH-12-EM-108${aId}` : '15400 Direct',
      estimated_eta: estimated_eta || 20,
      asv_vials_reserved: vialsToReserve,
      status: 'dispatched',
      created_at: new Date().toISOString()
    };

    mockStore.active_cases.unshift(newCase);

    return res.json({
      success: true,
      message: 'EMERGENCY DISPATCH EXECUTED & ASV RESERVED (MOCK STORE)',
      case_id: newCaseId,
      asv_vials_reserved: vialsToReserve,
      remaining_asv_vials: hospital.current_asv_vials,
      hospital_name: hospital.name
    });
  }
}

export async function getActiveCases(req, res) {
  try {
    if (isConnected) {
      const rows = await query(
        `SELECT c.*, h.name as hospital_name, a.vehicle_number as ambulance_number 
         FROM active_cases c 
         LEFT JOIN hospitals h ON c.assigned_hospital_id = h.id 
         LEFT JOIN ambulances a ON c.assigned_ambulance_id = a.id 
         ORDER BY c.id DESC`
      );
      return res.json({ success: true, count: rows.length, data: rows });
    } else {
      return res.json({ success: true, count: mockStore.active_cases.length, data: mockStore.active_cases });
    }
  } catch (error) {
    console.error('Error fetching active cases:', error);
    return res.json({ success: true, count: mockStore.active_cases.length, data: mockStore.active_cases });
  }
}

// Receive live GPS telemetry ping from ambulance driver/device
export async function receiveTelemetry(req, res) {
  try {
    const { ambulance_id, latitude, longitude } = req.body;
    if (!ambulance_id || !latitude || !longitude) {
      return res.status(400).json({ success: false, error: 'ambulance_id, latitude, and longitude are required' });
    }

    const aId = parseInt(ambulance_id, 10);
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    const now = new Date();

    if (isConnected) {
      await query(
        'UPDATE ambulances SET current_lat = ?, current_lon = ?, last_ping_time = ? WHERE id = ?',
        [lat, lon, now, aId]
      );
    } else {
      const amb = mockStore.ambulances.find(a => a.id === aId);
      if (amb) {
        amb.current_lat = lat;
        amb.current_lon = lon;
        amb.last_ping_time = now.toISOString();
      }
    }

    return res.json({ success: true, message: `Telemetry updated for ambulance ${aId}`, timestamp: now });
  } catch (error) {
    console.error('Error updating ambulance telemetry:', error);
    return res.status(500).json({ success: false, error: 'Failed to record ambulance telemetry' });
  }
}

// Get tracking status for a specific ambulance (3-state evaluator)
export async function getAmbulanceTracking(req, res) {
  try {
    const { ambulanceId } = req.params;
    const aId = parseInt(ambulanceId, 10);

    let ambulance = null;
    if (isConnected) {
      const rows = await query('SELECT * FROM ambulances WHERE id = ?', [aId]);
      if (rows.length > 0) ambulance = rows[0];
    } else {
      ambulance = mockStore.ambulances.find(a => a.id === aId);
    }

    if (!ambulance) {
      return res.json({ success: true, tracking_state: 'NO_AMBULANCE', ambulance: null });
    }

    const lastPing = ambulance.last_ping_time ? new Date(ambulance.last_ping_time).getTime() : 0;
    const elapsedSeconds = Math.floor((Date.now() - lastPing) / 1000);
    const trackingState = elapsedSeconds <= 30 ? 'ACTIVE_TRACKING' : 'SIGNAL_LOST';

    return res.json({
      success: true,
      tracking_state: trackingState,
      last_ping_seconds_ago: elapsedSeconds,
      ambulance
    });
  } catch (error) {
    console.error('Error fetching ambulance tracking:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch ambulance tracking status' });
  }
}
