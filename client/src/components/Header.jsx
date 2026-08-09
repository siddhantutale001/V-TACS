import React from 'react';

export default function Header({ user, onOpenLogin }) {
  return (
    <div className="win-header">
      <div className="win-header-title">
        <span>V-TACS v1.0 [NAPSE National Action Plan Standard]</span>
        <span className="win-header-badge">HELPLINE: 15400 ACTIVE</span>
        <span className="win-header-badge">OSRM + HAVERSINE ENGINE</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontFamily: 'monospace', fontSize: '11px' }}>
          OFFICER: {user ? user.name : 'DEMO_OFFICER (UNAUTHENTICATED)'}
        </span>
        {user ? (
          <button style={{ padding: '1px 6px', fontSize: '10px' }} onClick={onOpenLogin}>LOGOUT</button>
        ) : (
          <button className="primary" style={{ padding: '1px 6px', fontSize: '10px' }} onClick={onOpenLogin}>OFFICER LOGIN</button>
        )}
      </div>
    </div>
  );
}
