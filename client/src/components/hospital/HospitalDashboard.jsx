import React, { useState, useEffect } from 'react';
import Header from '../Header';
import VoiceTriagePanel from '../VoiceTriagePanel';
import TriageForm from '../TriageForm';
import HospitalList from '../HospitalList';
import DispatchControl from '../DispatchControl';
import ActiveCasesGrid from '../ActiveCasesGrid';
import { 
  fetchHospitals, 
  calculateTriageMatch, 
  parseVoiceTranscript, 
  executeDispatch, 
  fetchActiveCases 
} from '../../services/api';

export default function HospitalDashboard({ user, onBackToLanding }) {
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
    showNotification('SUCCESS', 'Voice triage parsed via Gemini 2.5 Flash!');
  };

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
        loadInitialData();
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px', background: '#000080', padding: '2px 4px', color: '#FFF' }}>
        <button style={{ fontSize: '10px', padding: '1px 5px' }} onClick={onBackToLanding}>
          ← RETURN TO PORTAL GATEWAY
        </button>
        <span style={{ fontFamily: 'monospace', fontSize: '11px' }}>HOSPITAL ADMINISTRATIVE UTILITY DASHBOARD</span>
      </div>

      <Header user={user} onOpenLogin={() => {}} />

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

      {/* Classic Single-Page Windows Utility Grid */}
      <div className="dashboard-grid">
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

      <div className="win-statusbar">
        <span>V-TACS STATUS: ONLINE</span>
        <span>OSRM API: READY (HAVERSINE FALLBACK: ACTIVE)</span>
        <span>GEMINI 2.5 FLASH: ACTIVE</span>
      </div>
    </div>
  );
}
