import React from 'react';

export default function AmbulanceTrackerCard({ ambulance, trackingState = 'ACTIVE_TRACKING', lastPingSeconds = 5, onCallDriver }) {
  if (!ambulance || trackingState === 'NO_AMBULANCE') {
    return (
      <div style={{
        backgroundColor: '#FEF2F2',
        border: '2px solid #EF4444',
        borderRadius: '12px',
        padding: '16px',
        color: '#991B1B',
        marginBottom: '16px'
      }}>
        <div style={{ fontWeight: 'bold', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          🚨 NO AMBULANCE AVAILABLE IN REGION
        </div>
        <p style={{ fontSize: '12px', margin: '0 0 10px 0', color: '#7F1D1D' }}>
          All regional emergency ambulances are currently dispatched. Please arrange immediate private transport directly to the assigned hospital.
        </p>
        <a 
          href="tel:108"
          style={{
            display: 'inline-block',
            backgroundColor: '#DC2626',
            color: '#FFFFFF',
            padding: '8px 16px',
            borderRadius: '6px',
            textDecoration: 'none',
            fontSize: '12px',
            fontWeight: 'bold'
          }}
        >
          📞 CALL 108 NATIONAL HELPLINE DIRECTLY
        </a>
      </div>
    );
  }

  if (trackingState === 'SIGNAL_LOST') {
    return (
      <div style={{
        backgroundColor: '#FFFBEB',
        border: '2px solid #F59E0B',
        borderRadius: '12px',
        padding: '16px',
        color: '#92400E',
        marginBottom: '16px'
      }}>
        <div style={{ fontWeight: 'bold', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span>⚠️ TELEMETRY SIGNAL INTERRUPTED</span>
          <span style={{ fontSize: '11px', background: '#FDE68A', padding: '2px 8px', borderRadius: '4px' }}>NO PING FOR {lastPingSeconds}s</span>
        </div>
        <p style={{ fontSize: '12px', margin: '0 0 10px 0', color: '#B45309' }}>
          Ambulance <strong>{ambulance.vehicle_number}</strong> GPS telemetry is offline. Displaying last known coordinate position. Please contact the driver directly.
        </p>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Driver: {ambulance.driver_name}</span>
          <a 
            href={`tel:${ambulance.driver_phone}`}
            style={{
              backgroundColor: '#D97706',
              color: '#FFFFFF',
              padding: '6px 12px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '12px',
              fontWeight: 'bold'
            }}
          >
            📞 Call {ambulance.driver_phone}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: '#F0FDF4',
      border: '2px solid #22C55E',
      borderRadius: '12px',
      padding: '16px',
      color: '#14532D',
      marginBottom: '16px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ fontWeight: 'bold', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          🟢 LIVE AMBULANCE TELEMETRY TRACKING
        </div>
        <span style={{ fontSize: '11px', backgroundColor: '#DCFCE7', color: '#15803D', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
          GPS LIVE ({lastPingSeconds}s ago)
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px', marginBottom: '10px' }}>
        <div>Vehicle: <strong>{ambulance.vehicle_number}</strong></div>
        <div>Status: <strong style={{ color: '#15803D' }}>EN ROUTE TO VICTIM</strong></div>
        <div>Driver: <strong>{ambulance.driver_name}</strong></div>
        <div>ETA: <strong style={{ color: '#15803D' }}>{ambulance.eta_to_victim_minutes || 12} mins</strong></div>
      </div>

      <a 
        href={`tel:${ambulance.driver_phone}`}
        style={{
          display: 'inline-block',
          backgroundColor: '#16A34A',
          color: '#FFFFFF',
          padding: '8px 14px',
          borderRadius: '6px',
          textDecoration: 'none',
          fontSize: '12px',
          fontWeight: 'bold'
        }}
      >
        📞 CALL DRIVER ({ambulance.driver_phone})
      </a>
    </div>
  );
}
