import React from 'react';

export default function DispatchControl({ matchData, selectedHospital, onExecuteDispatch, isDispatching }) {
  if (!matchData || !selectedHospital) {
    return (
      <div className="win-panel">
        <div className="win-panel-title">🚑 AMBULANCE MATCH & DISPATCH CONTROL</div>
        <div className="win-panel-body">
          <div style={{ padding: '15px', textAlign: 'center', fontFamily: 'monospace', color: '#808080' }}>
            Awaiting triage calculation... Select hospital and calculate match to enable dispatch.
          </div>
        </div>
      </div>
    );
  }

  const ambulance = matchData.matched_ambulance || {};
  const totalEta = matchData.total_estimated_eta_minutes || ((ambulance.eta_to_victim_minutes || 15) + selectedHospital.eta_minutes);

  return (
    <div className="win-panel">
      <div className="win-panel-title" style={{ background: '#800000', color: '#FFFFFF' }}>
        ⚡ EMERGENCY DISPATCH CONTROL PANEL
      </div>
      <div className="win-panel-body">
        <div style={{ border: '2px inset #808080', backgroundColor: '#FFFFFF', padding: '6px', marginBottom: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <strong>DESTINATION HOSPITAL:</strong>
            <span className="badge badge-blue">{selectedHospital.name}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <strong>ASSIGNED AMBULANCE:</strong>
            <span className="badge badge-green">{ambulance.vehicle_number || 'AMB-108'} ({ambulance.driver_name || 'Standby Driver'})</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <strong>AMBULANCE ETA TO VICTIM:</strong>
            <span className="badge badge-amber">{ambulance.eta_to_victim_minutes || 15} MIN</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <strong>HOSPITAL TRAVEL ETA:</strong>
            <span className="badge badge-amber">{selectedHospital.eta_minutes} MIN</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #C0C0C0', paddingTop: '4px', marginTop: '4px' }}>
            <strong style={{ color: '#800000', fontSize: '12px' }}>TOTAL ESTIMATED ETA:</strong>
            <strong style={{ fontSize: '13px', color: '#800000' }}>~{totalEta} MINUTES</strong>
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFE0', border: '1px outset #808080', padding: '4px', fontSize: '10px', marginBottom: '6px' }}>
          ⚠️ <strong>DETERMINISTIC SAFETY PROTOCOL:</strong>
          <div>Voice AI has formatted the payload. Reserving ASV vials and dispatching ambulance requires manual button authorization below.</div>
        </div>

        <button 
          className="danger" 
          style={{ width: '100%', padding: '8px', fontSize: '12px', letterSpacing: '0.5px' }}
          onClick={onExecuteDispatch}
          disabled={isDispatching}
        >
          {isDispatching ? 'EXECUTING DISPATCH & RESERVING ASV...' : '🚨 CONFIRM DISPATCH & RESERVE ASV VIALS'}
        </button>
      </div>
    </div>
  );
}
