import React, { useState, useEffect } from 'react';
import Header from '../Header';
import { fetchHospitals, fetchActiveCases, updateAsvStock } from '../../services/api';

export default function HospitalDashboard({ officerUser, onLogout, onBackToLanding }) {
  const [hospitals, setHospitals] = useState([]);
  const [activeCases, setActiveCases] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  
  // Stock & Operational State
  const [editAsvCount, setEditAsvCount] = useState(0);
  const [editVentilator, setEditVentilator] = useState(true);
  const [editIsOpen, setEditIsOpen] = useState(true);
  const [editAcceptingPatients, setEditAcceptingPatients] = useState(true);
  const [editIs247, setEditIs247] = useState(true);
  const [editOpeningTime, setEditOpeningTime] = useState('08:00');
  const [editClosingTime, setEditClosingTime] = useState('20:00');
  const [isUpdating, setIsUpdating] = useState(false);
  const [auditMessage, setAuditMessage] = useState('');
  const [incomingAlarmCase, setIncomingAlarmCase] = useState(null);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [hospRes, caseRes] = await Promise.all([
        fetchHospitals().catch(() => null),
        fetchActiveCases().catch(() => null)
      ]);

      if (hospRes && hospRes.data) {
        setHospitals(hospRes.data);
        if (hospRes.data.length > 0 && !selectedHospital) {
          const myHospital = hospRes.data[0]; // Default Sassoon Apex
          populateEditForm(myHospital);
        }
      }

      if (caseRes && caseRes.data) {
        const previousCount = activeCases.length;
        setActiveCases(caseRes.data);
        if (caseRes.data.length > previousCount && previousCount > 0) {
          setIncomingAlarmCase(caseRes.data[0]);
        }
      }
    } catch (err) {
      console.warn('Data load warning:', err);
    }
  };

  const populateEditForm = (h) => {
    setSelectedHospital(h);
    setEditAsvCount(h.current_asv_vials);
    setEditVentilator(Boolean(h.ventilator_available));
    setEditIsOpen(h.is_open !== undefined ? Boolean(h.is_open) : true);
    setEditAcceptingPatients(h.accepting_patients !== undefined ? Boolean(h.accepting_patients) : true);
    setEditIs247(h.is_24_7 !== undefined ? Boolean(h.is_24_7) : true);
    setEditOpeningTime(h.opening_time ? h.opening_time.substring(0, 5) : '08:00');
    setEditClosingTime(h.closing_time ? h.closing_time.substring(0, 5) : '20:00');
    setAuditMessage('');
  };

  const handleSelectHospitalForEdit = (h) => {
    populateEditForm(h);
  };

  const handleUpdateStock = async (e) => {
    e.preventDefault();
    if (!selectedHospital) return;
    setIsUpdating(true);
    setAuditMessage('');

    try {
      await updateAsvStock(selectedHospital.id, editAsvCount, editVentilator, 'demo-token', {
        is_open: editIsOpen,
        accepting_patients: editAcceptingPatients,
        is_24_7: editIs247,
        opening_time: editOpeningTime,
        closing_time: editClosingTime
      });
      setAuditMessage(`✓ Operational status updated for ${selectedHospital.name}`);
      loadData();
    } catch (err) {
      console.error('Failed to update status:', err);
      setAuditMessage('⚠️ Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  // CSV Audit Export
  const handleExportCSV = () => {
    if (activeCases.length === 0) {
      alert('No active cases available to export.');
      return;
    }
    const headers = ["Case ID", "Dispatch Time", "Location", "Symptoms", "Blood Group", "Medical History", "Emergency Contact", "ASV Reserved", "ETA Mins", "Status"];
    const rows = activeCases.map(c => [
      c.id,
      new Date(c.created_at || c.bite_time).toLocaleString(),
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
    link.setAttribute("download", `vtacs_audit_log_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="app-container">
      
      {/* Utility Top Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', background: '#000080', padding: '3px 6px', color: '#FFF' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button style={{ fontSize: '10px', padding: '2px 6px', fontWeight: 'bold' }} onClick={onBackToLanding}>
            ← PORTAL GATEWAY
          </button>
          <span style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: 'bold' }}>
            HOSPITAL RESOURCE OPERATIONS & ASV AUDIT CENTER [NAPSE PROTOCOL]
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#FFFF00' }}>
            LOGGED IN: {officerUser?.name || 'Dr. Rajesh Patil (Medical Officer)'}
          </span>
          <button className="danger" style={{ fontSize: '10px', padding: '2px 6px' }} onClick={onLogout}>
            LOGOUT
          </button>
        </div>
      </div>

      <Header user={officerUser} onOpenLogin={() => {}} />

      {/* Main Hospital Operational Grid */}
      <div className="dashboard-grid" style={{ gridTemplateColumns: '380px 1fr 340px' }}>
        
        {/* Left Column: Interactive ASV Stock Audit & Bed Capacity Update Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          
          <div className="win-panel">
            <div className="win-panel-title" style={{ background: '#000080', color: '#FFF' }}>
              💉 LIVE ASV INVENTORY AUDIT & STOCK CONTROL
            </div>
            <div className="win-panel-body">
              {selectedHospital ? (
                <form onSubmit={handleUpdateStock} style={{ background: '#FFF', border: '2px inset #808080', padding: '6px' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '4px', color: '#000080' }}>
                    SELECTED FACILITY:
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '2px' }}>
                    {selectedHospital.name}
                  </div>
                  <div style={{ fontSize: '9px', color: '#666', marginBottom: '8px' }}>
                    {selectedHospital.address}
                  </div>

                  {/* Critical Stockout Warning Banner */}
                  {selectedHospital.current_asv_vials < 5 && (
                    <div style={{ backgroundColor: '#FEF2F2', border: '2px solid #EF4444', color: '#991B1B', padding: '6px', fontSize: '10px', fontWeight: 'bold', borderRadius: '4px', marginBottom: '8px' }}>
                      🚨 CRITICAL ASV STOCKOUT RISK (&lt; 5 VIALS REMAINING)
                    </div>
                  )}

                  <div style={{ marginBottom: '8px' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', fontSize: '11px' }}>Current ASV Vials in Stock:</label>
                    <input 
                      type="number" 
                      value={editAsvCount} 
                      onChange={e => setEditAsvCount(parseInt(e.target.value, 10) || 0)} 
                      min="0" 
                      max="500" 
                      style={{ width: '100%', padding: '4px', border: '2px inset #808080', fontFamily: 'monospace', fontSize: '12px', fontWeight: 'bold' }}
                      required 
                    />
                  </div>

                  <div style={{ marginBottom: '6px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }}>
                      <input 
                        type="checkbox" 
                        checked={editVentilator} 
                        onChange={e => setEditVentilator(e.target.checked)} 
                      />
                      ICU VENTILATOR READY & OPERATIONAL
                    </label>
                  </div>

                  {/* Operational Toggles */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '8px', borderTop: '1px solid #CBD5E1', paddingTop: '6px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px', color: editIsOpen ? '#16A34A' : '#DC2626' }}>
                      <input 
                        type="checkbox" 
                        checked={editIsOpen} 
                        onChange={e => setEditIsOpen(e.target.checked)} 
                      />
                      FACILITY OPERATIONAL STATUS ({editIsOpen ? 'OPEN' : 'CLOSED'})
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px', color: editAcceptingPatients ? '#16A34A' : '#DC2626' }}>
                      <input 
                        type="checkbox" 
                        checked={editAcceptingPatients} 
                        onChange={e => setEditAcceptingPatients(e.target.checked)} 
                      />
                      ACCEPTING EMERGENCY PATIENTS ({editAcceptingPatients ? 'YES' : 'NO - OVERCROWDED'})
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }}>
                      <input 
                        type="checkbox" 
                        checked={editIs247} 
                        onChange={e => setEditIs247(e.target.checked)} 
                      />
                      OPEN 24 HOURS (24/7 EMERGENCY CARE)
                    </label>

                    {!editIs247 && (
                      <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                        <div>
                          <label style={{ fontSize: '9px', fontWeight: 'bold' }}>OPENING TIME</label>
                          <input 
                            type="time" 
                            value={editOpeningTime} 
                            onChange={e => setEditOpeningTime(e.target.value)}
                            style={{ fontSize: '10px', padding: '2px' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '9px', fontWeight: 'bold' }}>CLOSING TIME</label>
                          <input 
                            type="time" 
                            value={editClosingTime} 
                            onChange={e => setEditClosingTime(e.target.value)}
                            style={{ fontSize: '10px', padding: '2px' }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {auditMessage && (
                    <div style={{ background: auditMessage.includes('✓') ? '#E6FFFA' : '#FFF5F5', color: auditMessage.includes('✓') ? '#234E52' : '#9B2C2C', padding: '4px', fontSize: '10px', fontFamily: 'monospace', marginBottom: '6px', border: '1px solid #808080' }}>
                      {auditMessage}
                    </div>
                  )}

                  <button 
                    type="submit" 
                    className="primary" 
                    style={{ width: '100%', padding: '6px', fontSize: '11px', letterSpacing: '0.5px' }}
                    disabled={isUpdating}
                  >
                    {isUpdating ? 'SAVING AUDIT RECORD...' : '💾 SAVE & SYNC ASV STOCK TO AIVEN CLOUD'}
                  </button>
                </form>
              ) : (
                <div style={{ padding: '10px', fontSize: '11px' }}>Select a hospital from table to audit stock.</div>
              )}
            </div>
          </div>

          <div className="win-panel">
            <div className="win-panel-title">🛏️ ICU & TRAUMA BED CAPACITY MONITOR</div>
            <div className="win-panel-body" style={{ fontSize: '10px', fontFamily: 'monospace' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>TRAUMA ICU BEDS:</span>
                <span className="badge badge-green">14 / 20 AVAILABLE</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>ICU VENTILATORS:</span>
                <span className="badge badge-green">6 OPERATIONAL</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>ASV RE-ORDER THRESHOLD:</span>
                <span className="badge badge-amber">&lt; 15 VIALS</span>
              </div>
              <div style={{ fontSize: '9px', color: '#666', borderTop: '1px solid #808080', paddingTop: '4px', marginTop: '4px' }}>
                Automated NAPSE alert triggered when regional stock drops below 20 vials per district.
              </div>
            </div>
          </div>

        </div>

        {/* Center Column: Incoming Victim Dispatch Tracker */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div className="win-panel" style={{ flex: 1 }}>
            <div className="win-panel-title" style={{ display: 'flex', justifyContent: 'space-between', background: '#800000', color: '#FFF' }}>
              <span>🚨 INCOMING VICTIM DISPATCH & PATIENT TRACKER</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button style={{ fontSize: '9px', padding: '0px 4px', background: '#16A34A', color: '#FFF', fontWeight: 'bold' }} onClick={handleExportCSV}>
                  📄 EXPORT AUDIT LOG (CSV)
                </button>
                <button style={{ fontSize: '9px', padding: '0px 4px' }} onClick={loadData}>REFRESH FEED</button>
              </div>
            </div>
            <div className="win-panel-body" style={{ overflowX: 'auto' }}>
              {activeCases.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'monospace', color: '#808080' }}>
                  No incoming envenoming dispatches currently active for this facility.
                </div>
              ) : (
                <table className="win-table">
                  <thead>
                    <tr>
                      <th>CASE #</th>
                      <th>DISPATCH TIME</th>
                      <th>VICTIM LOCATION</th>
                      <th>SYMPTOMS / SEVERITY</th>
                      <th>ASV RESERVED</th>
                      <th>AMBULANCE & DRIVER</th>
                      <th>ETA</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeCases.map((c) => (
                      <tr key={c.id}>
                        <td><strong>#{c.id}</strong></td>
                        <td>{new Date(c.created_at || c.bite_time).toLocaleTimeString()}</td>
                        <td>
                          <strong>{c.location_description || `${c.victim_lat}, ${c.victim_lon}`}</strong>
                        </td>
                        <td>
                          <span style={{ fontSize: '10px' }}>{c.symptoms}</span>
                        </td>
                        <td>
                          <span className="badge badge-amber">{c.asv_vials_reserved || 10} VIALS</span>
                        </td>
                        <td>
                          <strong>{c.assigned_ambulance_number || 'MH-12-EM-1081'}</strong>
                        </td>
                        <td>
                          <span className="badge badge-red">{c.estimated_eta || 20} MIN</span>
                        </td>
                        <td>
                          <span className="badge badge-green">INCOMING</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Regional ASV Audit Monitor (Nearby Facilities) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div className="win-panel" style={{ flex: 1 }}>
            <div className="win-panel-title">🌐 REGIONAL ASV AUDIT & NEARBY HOSPITALS</div>
            <div className="win-panel-body" style={{ overflowX: 'auto' }}>
              <table className="win-table">
                <thead>
                  <tr>
                    <th>HOSPITAL</th>
                    <th>ASV VIALS</th>
                    <th>VENTILATOR</th>
                    <th>AUDIT</th>
                  </tr>
                </thead>
                <tbody>
                  {hospitals.map((h) => {
                    const isSelected = selectedHospital && selectedHospital.id === h.id;
                    return (
                      <tr key={h.id} className={isSelected ? 'selected' : ''}>
                        <td>
                          <strong>{h.name}</strong>
                          <div style={{ fontSize: '8px', opacity: 0.8 }}>{h.phone}</div>
                        </td>
                        <td>
                          <span className={`badge ${h.current_asv_vials > 15 ? 'badge-green' : (h.current_asv_vials > 0 ? 'badge-amber' : 'badge-red')}`}>
                            {h.current_asv_vials} VIALS
                          </span>
                        </td>
                        <td>
                          {h.ventilator_available ? (
                            <span className="badge badge-green">READY</span>
                          ) : (
                            <span className="badge badge-red">NONE</span>
                          )}
                        </td>
                        <td>
                          <button 
                            style={{ fontSize: '9px', padding: '1px 4px' }} 
                            onClick={() => handleSelectHospitalForEdit(h)}
                          >
                            SELECT
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      {/* Incoming Patient Emergency Alarm Modal */}
      {incomingAlarmCase && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            border: '4px solid #DC2626',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '480px',
            width: '90%',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '8px', animation: 'bounce 1s infinite' }}>🚨</div>
            <h2 style={{ color: '#DC2626', margin: '0 0 10px 0', fontSize: '20px', fontWeight: 'bold' }}>
              NEW INCOMING ENVENOMING VICTIM!
            </h2>
            <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', padding: '12px', borderRadius: '8px', marginBottom: '16px', textAlign: 'left', fontSize: '13px' }}>
              <div><strong>Case ID:</strong> #{incomingAlarmCase.id}</div>
              <div><strong>Location:</strong> {incomingAlarmCase.location_description || `${incomingAlarmCase.victim_lat}, ${incomingAlarmCase.victim_lon}`}</div>
              <div><strong>Symptoms:</strong> {incomingAlarmCase.symptoms}</div>
              <div><strong>ASV Reserved:</strong> <span style={{ color: '#DC2626', fontWeight: 'bold' }}>{incomingAlarmCase.asv_vials_reserved || 10} Vials</span></div>
              <div><strong>ETA to Hospital:</strong> <span style={{ color: '#DC2626', fontWeight: 'bold' }}>{incomingAlarmCase.estimated_eta || 20} Minutes</span></div>
              {incomingAlarmCase.victim_blood_group && <div><strong>Blood Group:</strong> {incomingAlarmCase.victim_blood_group}</div>}
              {incomingAlarmCase.victim_medical_history && <div><strong>Medical History:</strong> {incomingAlarmCase.victim_medical_history}</div>}
            </div>

            <button 
              type="button"
              style={{
                backgroundColor: '#16A34A',
                color: '#FFFFFF',
                border: 'none',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: 'bold',
                borderRadius: '8px',
                cursor: 'pointer',
                width: '100%'
              }}
              onClick={() => setIncomingAlarmCase(null)}
            >
              ✅ ACKNOWLEDGE & PREPARE ICU RESUSCITATION BAY
            </button>
          </div>
        </div>
      )}

      {/* Status Bar */}
      <div className="win-statusbar">
        <span>V-TACS HOSPITAL OPERATIONS: LIVE</span>
        <span>AIVEN CLOUD MYSQL SYNC: ACTIVE</span>
        <span>NAPSE HELPLINE: 15400 ACTIVE</span>
      </div>

    </div>
  );
}
