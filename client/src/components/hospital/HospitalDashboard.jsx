import React, { useState, useEffect, useRef } from 'react';
import Header from '../Header';
import { fetchHospitals, fetchActiveCases, updateAsvStock } from '../../services/api';

export default function HospitalDashboard({ officerUser, onLogout, onBackToLanding }) {
  const [hospitals, setHospitals] = useState([]);
  const [activeCases, setActiveCases] = useState([]);
  const [myHospital, setMyHospital] = useState(null);
  
  // Stock & Operational State for Authenticated Hospital
  const [editAsvCount, setEditAsvCount] = useState(42);
  const [editVentilator, setEditVentilator] = useState(true);
  const [editIsOpen, setEditIsOpen] = useState(true);
  const [editAcceptingPatients, setEditAcceptingPatients] = useState(true);
  const [editIs247, setEditIs247] = useState(true);
  const [editOpeningTime, setEditOpeningTime] = useState('08:00');
  const [editClosingTime, setEditClosingTime] = useState('20:00');
  const [isUpdating, setIsUpdating] = useState(false);
  const [auditMessage, setAuditMessage] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const formInitializedRef = useRef(false);
  const storageKey = `vtacs_cases_${officerUser?.facility_code || officerUser?.hospital_id || 'HOSP-YCM-01'}`;

  // 1. Initial Load and Persistent Local Cache Hydration
  useEffect(() => {
    // Load cached cases immediately from localStorage for rock-solid stability
    try {
      const cached = localStorage.getItem(storageKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setActiveCases(parsed);
        }
      }
    } catch (e) {}

    loadData(true);

    // Calm 30-second silent background sync (does NOT reset form or flash UI)
    const interval = setInterval(() => {
      loadData(false);
    }, 30000);

    return () => clearInterval(interval);
  }, [officerUser]);

  const loadData = async (isInitial = false) => {
    try {
      if (isInitial) setIsRefreshing(true);

      const [hospRes, caseRes] = await Promise.all([
        fetchHospitals().catch(() => null),
        fetchActiveCases().catch(() => null)
      ]);

      let hospList = hospRes?.data || [];
      if (hospList.length > 0) {
        setHospitals(hospList);
        const targetHospId = officerUser?.hospital_id || 1;
        const targetFacCode = officerUser?.facility_code;

        let matched = hospList.find(h => 
          (targetFacCode && h.facility_code === targetFacCode) || 
          h.id === targetHospId
        ) || hospList[0];

        setMyHospital(matched);

        // Only populate form fields ONCE on initial load to avoid typing interruptions
        if (!formInitializedRef.current) {
          populateEditForm(matched);
          formInitializedRef.current = true;
        }
      }

      // Merge and persist active victim cases
      if (caseRes && caseRes.data) {
        const targetHospId = officerUser?.hospital_id || 1;
        const incoming = caseRes.data.filter(c => !c.assigned_hospital_id || c.assigned_hospital_id === targetHospId);

        setActiveCases((prevCases) => {
          // Merge by case ID, preserving existing cases in persistent storage
          const map = new Map();
          prevCases.forEach(c => map.set(c.id, c));
          incoming.forEach(c => map.set(c.id, { ...map.get(c.id), ...c }));

          const merged = Array.from(map.values());
          try {
            localStorage.setItem(storageKey, JSON.stringify(merged));
          } catch (e) {}
          return merged;
        });
      }
    } catch (err) {
      console.warn('Data load warning:', err);
    } finally {
      if (isInitial) setIsRefreshing(false);
    }
  };

  const populateEditForm = (h) => {
    setEditAsvCount(h.current_asv_vials);
    setEditVentilator(Boolean(h.ventilator_available));
    setEditIsOpen(h.is_open !== undefined ? Boolean(h.is_open) : true);
    setEditAcceptingPatients(h.accepting_patients !== undefined ? Boolean(h.accepting_patients) : true);
    setEditIs247(h.is_24_7 !== undefined ? Boolean(h.is_24_7) : true);
    setEditOpeningTime(h.opening_time ? h.opening_time.substring(0, 5) : '08:00');
    setEditClosingTime(h.closing_time ? h.closing_time.substring(0, 5) : '20:00');
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await loadData(false);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleUpdateStock = async (e) => {
    e.preventDefault();
    if (!myHospital) return;
    setIsUpdating(true);
    setAuditMessage('');

    try {
      await updateAsvStock(myHospital.id, editAsvCount, editVentilator, 'scoped-officer-token', {
        is_open: editIsOpen,
        accepting_patients: editAcceptingPatients,
        is_24_7: editIs247,
        opening_time: editOpeningTime,
        closing_time: editClosingTime
      });
      setAuditMessage(`✓ ASV Stock & Bed status saved for ${myHospital.name}`);
      
      // Update local hospital list state
      setHospitals(prev => prev.map(h => h.id === myHospital.id ? { ...h, current_asv_vials: editAsvCount, ventilator_available: editVentilator ? 1 : 0 } : h));
      setMyHospital(prev => ({ ...prev, current_asv_vials: editAsvCount, ventilator_available: editVentilator ? 1 : 0 }));
    } catch (err) {
      console.error('Failed to update status:', err);
      setAuditMessage('⚠️ Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  // Mark a case as Admitted/Resolved and remove from active emergency queue
  const handleResolveCase = (caseId) => {
    if (!window.confirm(`Confirm admission & triage completion for Case #${caseId}?`)) return;
    
    setActiveCases((prevCases) => {
      const updated = prevCases.filter(c => c.id !== caseId);
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  // CSV Audit Export for this hospital
  const handleExportCSV = () => {
    if (activeCases.length === 0) {
      alert(`No active cases recorded for ${myHospital?.name || 'this facility'}.`);
      return;
    }
    const headers = ["Case ID", "Dispatch Time", "Location", "Symptoms", "Blood Group", "Medical History", "Emergency Contact", "ASV Reserved", "ETA Mins", "Status"];
    const rows = activeCases.map(c => [
      c.id,
      new Date(c.created_at || c.bite_time || Date.now()).toLocaleString(),
      `"${(c.location_description || '').replace(/"/g, '""')}"`,
      `"${(c.symptoms || '').replace(/"/g, '""')}"`,
      c.victim_blood_group || 'O+',
      `"${(c.victim_medical_history || '').replace(/"/g, '""')}"`,
      c.victim_emergency_contact || '',
      c.asv_vials_reserved || 10,
      c.estimated_eta || 20,
      c.status || 'dispatched'
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `vtacs_${officerUser?.facility_code || 'audit'}_log_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="app-container">
      
      {/* Top Scoped Medical Officer Status Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', background: '#000080', padding: '4px 8px', color: '#FFF' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button style={{ fontSize: '10px', padding: '2px 6px', fontWeight: 'bold', cursor: 'pointer' }} onClick={onBackToLanding}>
            ← PORTAL GATEWAY
          </button>
          <button 
            style={{ fontSize: '10px', padding: '2px 8px', fontWeight: 'bold', cursor: 'pointer', background: '#2563EB', color: '#FFF', border: '1px outset #FFF' }}
            onClick={handleManualRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? '🔄 REFRESHING...' : '🔄 REFRESH TELEMETRY'}
          </button>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#86EFAC', fontWeight: 'bold' }}>
            FACILITY: [{officerUser?.facility_code || 'HOSP-01'}] {officerUser?.hospital_name || myHospital?.name || 'Local Hospital'}
          </span>
          <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#FFFF00' }}>
            OFFICER: {officerUser?.officer_name || officerUser?.name || 'Dr. Medical Officer'} ({officerUser?.council_reg_number || 'MMC Verified'})
          </span>
          <button className="danger" style={{ fontSize: '10px', padding: '2px 6px', cursor: 'pointer' }} onClick={onLogout}>
            LOGOUT
          </button>
        </div>
      </div>

      <Header user={officerUser} onOpenLogin={() => {}} />

      {/* Main Scoped Hospital Operational Grid */}
      <div className="dashboard-grid" style={{ gridTemplateColumns: '400px 1fr 340px' }}>
        
        {/* Left Column: Dedicated ASV Inventory Audit & Stock Control */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          
          <div className="win-panel">
            <div className="win-panel-title" style={{ background: '#000080', color: '#FFF' }}>
              💉 LIVE ASV INVENTORY AUDIT & STOCK CONTROL
            </div>
            <div className="win-panel-body">
              {myHospital ? (
                <form onSubmit={handleUpdateStock} style={{ background: '#FFF', border: '2px inset #808080', padding: '8px' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '2px', color: '#000080' }}>
                    AUTHENTICATED FACILITY:
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#0F172A', marginBottom: '2px' }}>
                    [{myHospital.facility_code || officerUser?.facility_code}] {myHospital.name}
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748B', marginBottom: '10px' }}>
                    {myHospital.address} • Tel: {myHospital.phone}
                  </div>

                  {/* Stockout Warning Banner */}
                  {editAsvCount < 5 && (
                    <div style={{ backgroundColor: '#FEF2F2', border: '2px solid #EF4444', color: '#991B1B', padding: '6px', fontSize: '10px', fontWeight: 'bold', borderRadius: '4px', marginBottom: '8px' }}>
                      🚨 CRITICAL ASV STOCKOUT RISK (&lt; 5 VIALS REMAINING)
                    </div>
                  )}

                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', fontSize: '11px', marginBottom: '2px' }}>
                      Current Verified ASV Vials in Cold Storage:
                    </label>
                    <input 
                      type="number" 
                      min="0" 
                      max="500" 
                      value={editAsvCount} 
                      onChange={e => setEditAsvCount(parseInt(e.target.value, 10) || 0)} 
                      style={{ width: '100%', padding: '6px', fontSize: '14px', fontWeight: 'bold', fontFamily: 'monospace', border: '2px inset #808080', background: editAsvCount < 5 ? '#FEE2E2' : '#F0FDF4' }}
                      required
                    />
                  </div>

                  <div style={{ marginBottom: '10px', padding: '6px', background: '#F8FAFC', border: '1px solid #CBD5E1' }}>
                    <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: 'bold' }}>
                      <input 
                        type="checkbox" 
                        checked={editVentilator} 
                        onChange={e => setEditVentilator(e.target.checked)} 
                        style={{ width: '16px', height: '16px' }}
                      />
                      <span>ICU Ventilator Bed Available for Neurotoxic Victims</span>
                    </label>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '10px' }}>
                    <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', fontWeight: 'bold' }}>
                      <input type="checkbox" checked={editIsOpen} onChange={e => setEditIsOpen(e.target.checked)} />
                      <span>Facility Open</span>
                    </label>
                    <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', fontWeight: 'bold' }}>
                      <input type="checkbox" checked={editAcceptingPatients} onChange={e => setEditAcceptingPatients(e.target.checked)} />
                      <span>Accepting Trauma</span>
                    </label>
                  </div>

                  <div style={{ marginBottom: '10px', fontSize: '10px' }}>
                    <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', marginBottom: '4px' }}>
                      <input type="checkbox" checked={editIs247} onChange={e => setEditIs247(e.target.checked)} />
                      <span>24/7 Emergency Casualty Operational</span>
                    </label>

                    {!editIs247 && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '4px' }}>
                        <div>
                          <span style={{ fontSize: '9px', color: '#666' }}>Open:</span>
                          <input type="time" value={editOpeningTime} onChange={e => setEditOpeningTime(e.target.value)} style={{ width: '100%', fontSize: '10px' }} />
                        </div>
                        <div>
                          <span style={{ fontSize: '9px', color: '#666' }}>Close:</span>
                          <input type="time" value={editClosingTime} onChange={e => setEditClosingTime(e.target.value)} style={{ width: '100%', fontSize: '10px' }} />
                        </div>
                      </div>
                    )}
                  </div>

                  {auditMessage && (
                    <div style={{ background: '#F0FDF4', color: '#166534', border: '1px solid #86EFAC', padding: '4px 6px', fontSize: '10px', fontWeight: 'bold', marginBottom: '8px' }}>
                      {auditMessage}
                    </div>
                  )}

                  <button 
                    type="submit" 
                    className="primary" 
                    style={{ width: '100%', padding: '8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                    disabled={isUpdating}
                  >
                    {isUpdating ? 'SAVING AUDIT RECORD...' : '💾 SAVE & SYNC FACILITY ASV STOCK RECORD'}
                  </button>
                </form>
              ) : (
                <div style={{ padding: '20px', textAlign: 'center', fontSize: '11px' }}>
                  Loading facility telemetry...
                </div>
              )}
            </div>
          </div>

          {/* Quick Audit Export Action */}
          <div className="win-panel">
            <div className="win-panel-title">📋 NAPSE COMPLIANCE & AUDIT EXPORT</div>
            <div className="win-panel-body" style={{ padding: '6px' }}>
              <button 
                type="button" 
                onClick={handleExportCSV}
                style={{ width: '100%', padding: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', background: '#E2E8F0', border: '2px outset #FFF' }}
              >
                📥 EXPORT FACILITY DISPATCH AUDIT LOG (CSV)
              </button>
            </div>
          </div>

        </div>

        {/* Center Column: Scoped Incoming Victim Patient Queue (Rock-Solid Persistent) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          
          <div className="win-panel" style={{ flex: 1 }}>
            <div className="win-panel-title" style={{ background: '#990000', color: '#FFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>🚨 INCOMING VICTIM DISPATCH QUEUE ({activeCases.length} ACTIVE)</span>
              <span style={{ fontSize: '10px', background: '#FFF', color: '#990000', padding: '1px 6px', fontWeight: 'bold', borderRadius: '2px' }}>
                PERSISTENT QUEUE [{myHospital?.facility_code || 'HOSP-01'}]
              </span>
            </div>

            <div className="win-panel-body" style={{ maxHeight: '640px', overflowY: 'auto' }}>
              {activeCases.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {activeCases.map((c) => (
                    <div 
                      key={c.id} 
                      style={{ 
                        background: '#FFF', 
                        border: '2px solid #DC2626', 
                        padding: '10px', 
                        borderRadius: '4px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', borderBottom: '1px solid #FCA5A5', paddingBottom: '4px' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '12px', color: '#991B1B' }}>
                          🚨 CASE #{c.id} • EN ROUTE TO {myHospital?.name || 'YOUR FACILITY'}
                        </span>
                        <span style={{ background: '#DC2626', color: '#FFF', fontSize: '10px', padding: '2px 6px', fontWeight: 'bold', borderRadius: '3px' }}>
                          ETA: {c.estimated_eta || '15-20'} MINS
                        </span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '8px', fontSize: '11px', marginBottom: '6px' }}>
                        <div>
                          <strong>Victim Location:</strong> {c.location_description || `GPS (${c.victim_lat}, ${c.victim_lon})`}<br/>
                          <strong>Symptoms:</strong> <span style={{ color: '#991B1B' }}>{c.symptoms || 'Snakebite envenoming symptoms'}</span><br/>
                          <strong>Medical History / Allergies:</strong> {c.victim_medical_history || 'None reported'}
                        </div>
                        <div style={{ background: '#FEF2F2', padding: '6px', border: '1px solid #FECACA', borderRadius: '4px' }}>
                          💉 <strong>ASV Reserved:</strong> {c.asv_vials_reserved || 10} Vials<br/>
                          🩸 <strong>Blood Group:</strong> {c.victim_blood_group || 'O+'}<br/>
                          📞 <strong>Emergency Contact:</strong> {c.victim_emergency_contact || 'None'}
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FEF3C7', padding: '4px 8px', borderRadius: '3px', marginTop: '6px' }}>
                        <span style={{ fontSize: '10px', color: '#92400E', fontWeight: 'bold' }}>
                          🚑 Ambulance Assigned: {c.assigned_ambulance_number || c.assigned_ambulance_id ? `MH-12-EM-108${c.assigned_ambulance_id || 1}` : '108 Rapid Unit'}
                        </span>
                        <button 
                          type="button" 
                          onClick={() => handleResolveCase(c.id)}
                          style={{ fontSize: '10px', padding: '2px 8px', background: '#16A34A', color: '#FFF', fontWeight: 'bold', border: '1px outset #FFF', cursor: 'pointer' }}
                        >
                          ✓ ADMIT & RESOLVE
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748B' }}>
                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>🏥</div>
                  <strong>No Incoming Patient Dispatches En Route</strong><br/>
                  <span style={{ fontSize: '11px' }}>Casualty triage queue is currently clear for {myHospital?.name || 'this facility'}.</span>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Read-Only Regional Stock Matrix for Contingency */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          
          <div className="win-panel">
            <div className="win-panel-title">🌐 REGIONAL NETWORK ASV STOCKS (READ-ONLY)</div>
            <div className="win-panel-body" style={{ maxHeight: '640px', overflowY: 'auto' }}>
              <div style={{ fontSize: '10px', color: '#475569', marginBottom: '6px', fontStyle: 'italic' }}>
                For inter-hospital emergency stock transfer coordination:
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {hospitals.map(h => {
                  const isMyFacility = h.id === myHospital?.id;
                  return (
                    <div 
                      key={h.id}
                      style={{
                        padding: '6px 8px',
                        background: isMyFacility ? '#DCFCE7' : '#FFFFFF',
                        border: isMyFacility ? '2px solid #16A34A' : '1px solid #CBD5E1',
                        borderRadius: '4px',
                        fontSize: '11px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                        <strong style={{ color: isMyFacility ? '#166534' : '#0F172A' }}>
                          [{h.facility_code || `HOSP-0${h.id}`}] {h.name}
                        </strong>
                        {isMyFacility && (
                          <span style={{ fontSize: '9px', background: '#16A34A', color: '#FFF', padding: '1px 4px', borderRadius: '3px', fontWeight: 'bold' }}>
                            THIS FACILITY
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#475569' }}>
                        <span>💉 ASV Stock: <strong>{h.current_asv_vials} vials</strong></span>
                        <span>🫁 ICU Ventilator: <strong>{h.ventilator_available ? 'YES' : 'NO'}</strong></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Retro Utility Footer Bar */}
      <footer className="hosp-footer">
        <span>STATUS: MEDICAL OFFICER AUTHORIZED</span>
        <span>SCOPED FACILITY: {myHospital?.facility_code || 'HOSP-01'}</span>
        <span>QUEUE PERSISTENCE: LOCAL SECURE CACHE ACTIVE</span>
        <span>HELPLINE: 15400</span>
      </footer>

    </div>
  );
}
