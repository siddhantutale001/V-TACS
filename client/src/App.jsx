import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import VoiceTriagePanel from './components/VoiceTriagePanel';
import TriageForm from './components/TriageForm';
import HospitalList from './components/HospitalList';
import DispatchControl from './components/DispatchControl';
import ActiveCasesGrid from './components/ActiveCasesGrid';
import { 
  fetchHospitals, 
  calculateTriageMatch, 
  parseVoiceTranscript, 
  executeDispatch, 
  fetchActiveCases 
} from './services/api';

export default function App() {
  const [user, setUser] = useState(null); // Medical officer user session
  const [formData, setFormData] = useState({
    victim_lat: '18.7617',
    victim_lon: '73.8587',
    location_description: 'Chakan Market Yard (Rural North)',
    symptoms: 'Snakebite on leg, local swelling and breathing discomfort',
    asv_vials_needed: 10,
    requires_ventilator: false
  });

  const [matchData, setMatchData] = useState(null);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [activeCases, setActiveCases] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);
  const [notification, setNotification] = useState(null);

  // Load initial hospitals & active cases
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [hospRes, caseRes] = await Promise.all([
        fetchHospitals().catch(() => null),
        fetchActiveCases().catch(() => null)
      ]);
      if (hospRes && hospRes.data) setHospitals(hospRes.data);
      if (caseRes && caseRes.data) setActiveCases(caseRes.data);
    } catch (err) {
      console.warn('Initial data load error:', err);
    }
  };

  // Calculate OSRM/Haversine triage match
  const handleCalculateMatch = async () => {
    setIsLoading(true);
    try {
      const res = await calculateTriageMatch(formData);
      if (res && res.success && res.data) {
        setMatchData(res.data);
        setSelectedHospital(res.data.matched_hospital);
        showNotification('SUCCESS', `Match calculated via ${res.data.matched_hospital.engine}`);
      }
    } catch (err) {
      console.error('Calculate match error:', err);
      showNotification('ERROR', 'Failed to calculate triage routing matrix');
    } finally {
      setIsLoading(false);
    }
  };

  // Voice triage transcript completion from Gemini
  const handleApplyVoiceData = (parsedData) => {
    if (!parsedData) return;
    setFormData(prev => ({
      ...prev,
      victim_lat: parsedData.estimated_lat ? String(parsedData.estimated_lat) : prev.victim_lat,
      victim_lon: parsedData.estimated_lon ? String(parsedData.estimated_lon) : prev.victim_lon,
      location_description: parsedData.location_description || prev.location_description,
      symptoms: Array.isArray(parsedData.symptoms) ? parsedData.symptoms.join(', ') : (parsedData.symptoms || prev.symptoms),
      asv_vials_needed: parsedData.asv_vials_needed || prev.asv_vials_needed,
      requires_ventilator: Boolean(parsedData.requires_ventilator)
    }));
    showNotification('SUCCESS', 'Voice triage parsed via Gemini & dashboard updated!');
  };

  // Execute emergency dispatch & reserve ASV
  const handleExecuteDispatch = async () => {
    if (!selectedHospital || !matchData) return;
    setIsDispatching(true);
    try {
      const payload = {
        victim_lat: parseFloat(formData.victim_lat),
        victim_lon: parseFloat(formData.victim_lon),
        location_description: formData.location_description,
        symptoms: formData.symptoms,
        hospital_id: selectedHospital.id,
        ambulance_id: matchData.matched_ambulance ? matchData.matched_ambulance.id : null,
        estimated_eta: matchData.total_estimated_eta_minutes || selectedHospital.eta_minutes,
        asv_vials_reserved: formData.asv_vials_needed
      };

      const res = await executeDispatch(payload);
      if (res && res.success) {
        showNotification('SUCCESS', `🚨 DISPATCH CONFIRMED: Reserved ${res.asv_vials_reserved} ASV vials at ${res.hospital_name}`);
        loadInitialData(); // Refresh stock & cases log
      }
    } catch (err) {
      console.error('Dispatch execution error:', err);
      showNotification('ERROR', err.response?.data?.message || 'Failed to execute dispatch transaction');
    } finally {
      setIsDispatching(false);
    }
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  return (
    <div className="app-container">
      <Header user={user} onOpenLogin={() => setUser(user ? null : { name: 'Dr. Rajesh Patil (Sassoon)' })} />

      {notification && (
        <div style={{
          backgroundColor: notification.type === 'SUCCESS' ? '#008000' : '#800000',
          color: '#FFFFFF',
          padding: '4px 8px',
          fontWeight: 'bold',
          marginBottom: '4px',
          fontFamily: 'monospace',
          border: '1px outset #FFFFFF'
        }}>
          [{notification.type}] {notification.message}
        </div>
      )}

      {/* Unified Single-Page Utility Dashboard Grid */}
      <div className="dashboard-grid">
        
        {/* Left Column: Voice Intake & Triage Input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <VoiceTriagePanel 
            onApplyParsedData={handleApplyVoiceData}
            onParseVoiceTranscript={parseVoiceTranscript}
          />
          <TriageForm 
            formData={formData} 
            setFormData={setFormData} 
            onCalculateMatch={handleCalculateMatch}
            isLoading={isLoading}
          />
        </div>

        {/* Center Column: Hospitals Matrix & Active Cases Log */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <HospitalList 
            hospitals={matchData ? matchData.candidate_hospitals : hospitals}
            selectedHospital={selectedHospital}
            onSelectHospital={setSelectedHospital}
          />
          <ActiveCasesGrid 
            activeCases={activeCases} 
            onRefresh={loadInitialData}
          />
        </div>

        {/* Right Column: Dispatch Control & ASV Stock Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <DispatchControl 
            matchData={matchData}
            selectedHospital={selectedHospital}
            onExecuteDispatch={handleExecuteDispatch}
            isDispatching={isDispatching}
          />

          <div className="win-panel">
            <div className="win-panel-title">📦 REGIONAL ASV AUDIT MONITOR</div>
            <div className="win-panel-body" style={{ fontSize: '10px' }}>
              <div style={{ marginBottom: '4px' }}>
                <strong>TOTAL REGIONAL STOCK:</strong> {hospitals.reduce((acc, h) => acc + (h.current_asv_vials || 0), 0)} VIALS
              </div>
              <div style={{ marginBottom: '4px' }}>
                <strong>ICU VENTILATORS READY:</strong> {hospitals.filter(h => h.ventilator_available).length} HOSPITALS
              </div>
              <div style={{ fontSize: '9px', color: '#808080', borderTop: '1px solid #808080', paddingTop: '3px' }}>
                NAPSE Protocol: Minimum 10 ASV vials reserved per envenoming dispatch. Stock audited via MySQL Aiven cloud sync.
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Status Bar */}
      <div className="win-statusbar">
        <span>V-TACS STATUS: ONLINE</span>
        <span>OSRM API: READY (HAVERSINE FALLBACK: ACTIVE)</span>
        <span>WEB SPEECH API: ACTIVE</span>
      </div>
    </div>
  );
}
