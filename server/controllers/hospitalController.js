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

// Update hospital operational status, inventory, capacity, and hours
export async function updateAsvStock(req, res) {
  try {
    const { hospitalId } = req.params;
    const { 
      current_asv_vials, 
      ventilator_available,
      is_open,
      accepting_patients,
      is_24_7,
      opening_time,
      closing_time
    } = req.body;

    const hId = parseInt(hospitalId, 10);

    if (isConnected) {
      await query(
        `UPDATE hospitals SET 
          current_asv_vials = COALESCE(?, current_asv_vials), 
          ventilator_available = COALESCE(?, ventilator_available),
          is_open = COALESCE(?, is_open),
          accepting_patients = COALESCE(?, accepting_patients),
          is_24_7 = COALESCE(?, is_24_7),
          opening_time = COALESCE(?, opening_time),
          closing_time = COALESCE(?, closing_time)
         WHERE id = ?`,
        [current_asv_vials, ventilator_available, is_open, accepting_patients, is_24_7, opening_time, closing_time, hId]
      );
    } else {
      const hospital = mockStore.hospitals.find(h => h.id === hId);
      if (hospital) {
        if (current_asv_vials !== undefined) hospital.current_asv_vials = parseInt(current_asv_vials, 10);
        if (ventilator_available !== undefined) hospital.ventilator_available = ventilator_available ? 1 : 0;
        if (is_open !== undefined) hospital.is_open = is_open ? 1 : 0;
        if (accepting_patients !== undefined) hospital.accepting_patients = accepting_patients ? 1 : 0;
        if (is_24_7 !== undefined) hospital.is_24_7 = is_24_7 ? 1 : 0;
        if (opening_time !== undefined) hospital.opening_time = opening_time;
        if (closing_time !== undefined) hospital.closing_time = closing_time;
      }
    }

    return res.json({ success: true, message: `Hospital ID ${hId} status updated successfully` });
  } catch (error) {
    console.error('Error updating hospital status:', error);
    return res.status(500).json({ success: false, error: 'Failed to update hospital operational status' });
  }
}
