import React from 'react';

export default function ActiveCasesGrid({ activeCases, onRefresh }) {
  return (
    <div className="win-panel">
      <div className="win-panel-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>📋 ACTIVE DISPATCH CASES & ASV AUDIT TRAIL</span>
        <button style={{ padding: '0px 4px', fontSize: '9px' }} onClick={onRefresh}>REFRESH LOGS</button>
      </div>
      <div className="win-panel-body" style={{ overflowX: 'auto' }}>
        {activeCases.length === 0 ? (
          <div style={{ padding: '10px', textAlign: 'center', color: '#808080', fontFamily: 'monospace' }}>
            No active dispatch cases recorded.
          </div>
        ) : (
          <table className="win-table">
            <thead>
              <tr>
                <th>CASE #</th>
                <th>TIMESTAMP</th>
                <th>LOCATION</th>
                <th>ASSIGNED HOSPITAL</th>
                <th>AMBULANCE</th>
                <th>ASV RESERVED</th>
                <th>ETA</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {activeCases.map((c) => (
                <tr key={c.id}>
                  <td><strong>#{c.id}</strong></td>
                  <td>{new Date(c.created_at || c.bite_time).toLocaleTimeString()}</td>
                  <td>{c.location_description || `${c.victim_lat}, ${c.victim_lon}`}</td>
                  <td><strong>{c.assigned_hospital_name || `Hospital #${c.assigned_hospital_id}`}</strong></td>
                  <td>{c.assigned_ambulance_number || `Ambulance #${c.assigned_ambulance_id}`}</td>
                  <td>
                    <span className="badge badge-amber">{c.asv_vials_reserved || 10} VIALS</span>
                  </td>
                  <td>{c.estimated_eta} MIN</td>
                  <td>
                    <span className={`badge ${c.status === 'dispatched' ? 'badge-green' : 'badge-blue'}`}>
                      {c.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
