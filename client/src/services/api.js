import axios from 'axios';

const API_BASE = '/api';

export async function fetchHospitals() {
  const response = await axios.get(`${API_BASE}/hospitals`);
  return response.data;
}

export async function fetchAmbulances() {
  const response = await axios.get(`${API_BASE}/ambulances`);
  return response.data;
}

export async function calculateTriageMatch(triagePayload) {
  const response = await axios.post(`${API_BASE}/triage/match`, triagePayload);
  return response.data;
}

export async function parseVoiceTranscript(transcript) {
  const response = await axios.post(`${API_BASE}/triage/voice-parse`, { transcript });
  return response.data;
}

export async function executeDispatch(dispatchPayload) {
  const response = await axios.post(`${API_BASE}/dispatch/execute`, dispatchPayload);
  return response.data;
}

export async function fetchActiveCases() {
  const response = await axios.get(`${API_BASE}/dispatch/cases`);
  return response.data;
}

export async function updateAsvStock(hospitalId, currentAsvVials, ventilatorAvailable, token) {
  const response = await axios.patch(
    `${API_BASE}/hospitals/${hospitalId}/asv`,
    { current_asv_vials: currentAsvVials, ventilator_available: ventilatorAvailable },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
}

export async function loginUser(username, password) {
  const response = await axios.post(`${API_BASE}/auth/login`, { username, password });
  return response.data;
}
