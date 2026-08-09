import React from 'react';

export default function HospitalList({ hospitals, selectedHospital, onSelectHospital }) {
  if (!hospitals || hospitals.length === 0) {
    return (
      <div className="win-panel" style={{ flex: 1 }}>
        <div className="win-panel-title">🏥 EQUIPPED HOSPITALS MATRIX & ASV AUDIT</div>
        <div className="win-panel-body">
          <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'monospace', color: '#808080' }}>
            No routing calculation executed yet. Enter victim location or voice triage to calculate nearest equipped hospital.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="win-panel" style={{ flex: 1 }}>
      <div className="win-panel-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>🏥 EQUIPPED HOSPITALS MATRIX & ASV AUDIT ({hospitals.length} QUALIFIED)</span>
        <span style={{ fontSize: '10px', color: '#FFFF00' }}>SORTED BY MATCH SUITABILITY</span>
      </div>
      <div className="win-panel-body" style={{ overflowX: 'auto' }}>
        <table className="win-table">
          <thead>
            <tr>
              <th>RANK</th>
              <th>HOSPITAL NAME</th>
              <th>DIST (KM)</th>
              <th>ETA (MIN)</th>
              <th>ASV STOCK</th>
              <th>VENTILATOR</th>
              <th>ROUTING ENGINE</th>
              <th>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {hospitals.map((h, idx) => {
              const isSelected = selectedHospital && selectedHospital.id === h.id;
              return (
                <tr key={h.id} className={isSelected ? 'selected' : ''}>
                  <td><strong>#{idx + 1}</strong></td>
                  <td>
                    <strong>{h.name}</strong>
                    <div style={{ fontSize: '9px', opacity: 0.8 }}>{h.address}</div>
                  </td>
                  <td>{h.distance_km} km</td>
                  <td>
                    <span className="badge badge-amber">{h.eta_minutes} MIN</span>
                  </td>
                  <td>
                    <span className={`badge ${h.current_asv_vials > 15 ? 'badge-green' : (h.current_asv_vials > 0 ? 'badge-amber' : 'badge-red')}`}>
                      {h.current_asv_vials} VIALS
                    </span>
                  </td>
                  <td>
                    {h.ventilator_available ? (
                      <span className="badge badge-green">AVAILABLE</span>
                    ) : (
                      <span className="badge badge-red">UNAVAILABLE</span>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${h.fallback_used ? 'badge-red' : 'badge-blue'}`}>
                      {h.engine || 'OSRM'}
                    </span>
                  </td>
                  <td>
                    <button 
                      className={isSelected ? 'success' : ''} 
                      style={{ padding: '1px 5px', fontSize: '10px' }}
                      onClick={() => onSelectHospital(h)}
                    >
                      {isSelected ? 'SELECTED ✓' : 'SELECT'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
