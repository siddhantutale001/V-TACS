import { query, isConnected } from '../config/db.js';
import { mockStore } from '../db/mockStore.js';

// Get all hospitals with current ASV vials and ventilator availability
export async function getHospitals(req, res) {
  try {
    if (isConnected) {
      const rows = await query('SELECT id, name, latitude, longitude, current_asv_vials, ventilator_available, phone, address, updated_at FROM hospitals ORDER BY current_asv_vials DESC');
      return res.json({ success: true, count: rows.length, source: 'MySQL', data: rows });
    } else {
      return res.json({ success: true, count: mockStore.hospitals.length, source: 'IN_MEMORY_STORE', data: mockStore.hospitals });
    }
  } catch (error) {
    console.error('Error fetching hospitals:', error);
    return res.json({ success: true, count: mockStore.hospitals.length, source: 'FALLBACK_STORE', data: mockStore.hospitals });
  }
}

// Get all ambulances
export async function getAmbulances(req, res) {
  try {
    if (isConnected) {
      const rows = await query('SELECT id, vehicle_number, current_lat, current_lon, status, driver_name, driver_phone FROM ambulances');
      return res.json({ success: true, count: rows.length, source: 'MySQL', data: rows });
    } else {
      return res.json({ success: true, count: mockStore.ambulances.length, source: 'IN_MEMORY_STORE', data: mockStore.ambulances });
    }
  } catch (error) {
    console.error('Error fetching ambulances:', error);
    return res.json({ success: true, count: mockStore.ambulances.length, source: 'FALLBACK_STORE', data: mockStore.ambulances });
  }
}

// Update hospital ASV stock manually (Medical Officer Audit feature)
export async function updateAsvStock(req, res) {
  try {
    const { hospitalId } = req.params;
    const { current_asv_vials, ventilator_available } = req.body;

    if (current_asv_vials === undefined) {
      return res.status(400).json({ success: false, error: 'current_asv_vials count is required' });
    }

    if (isConnected) {
      await query(
        'UPDATE hospitals SET current_asv_vials = ?, ventilator_available = COALESCE(?, ventilator_available) WHERE id = ?',
        [current_asv_vials, ventilator_available, hospitalId]
      );
    } else {
      const hospital = mockStore.hospitals.find(h => h.id === parseInt(hospitalId, 10));
      if (hospital) {
        hospital.current_asv_vials = current_asv_vials;
        if (ventilator_available !== undefined) hospital.ventilator_available = ventilator_available ? 1 : 0;
      }
    }

    return res.json({ success: true, message: `ASV stock updated successfully for hospital ID ${hospitalId}` });
  } catch (error) {
    console.error('Error updating ASV stock:', error);
    return res.status(500).json({ success: false, error: 'Failed to update ASV stock' });
  }
}
