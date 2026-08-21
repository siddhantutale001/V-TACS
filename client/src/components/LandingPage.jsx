import React from 'react';

export default function LandingPage({ onSelectPortal }) {
  return (
    <div className="landing-container">
      <div className="landing-card-wrapper">
        
        {/* Brand Header */}
        <div className="landing-header">
          <div className="landing-logo">🐍 V-TACS</div>
          <div className="landing-title">Venom Treatment & Ambulance Coordination System</div>
          <div className="landing-subtitle">
            National Action Plan for Prevention & Control of Snakebite Envenoming (NAPSE) India
          </div>
          <div className="landing-badge">HELPLINE TOLL-FREE: 15400</div>
        </div>

        <div className="landing-prompt-title">Select Portal Gateway to Proceed:</div>

        {/* Portal Choice Cards */}
        <div className="portal-grid">
          
          {/* Card 1: Emergency Victim / Citizen Portal */}
          <div className="portal-card user-portal-card" onClick={() => onSelectPortal('USER_PORTAL')}>
            <div className="portal-icon">🆘</div>
            <h3>Public Emergency Triage</h3>
            <p>Hands-Free Conversational Voice Triage powered by AI Medical Triage Engine. Fast emergency routing, ASV hospital locator, & instant ambulance dispatch.</p>
            <div className="landing-feature-pills">
              <span>⚡ Real-Time ASV Stock Matrix</span>
              <span>🎙️ AI Voice Triage</span>
              <span>🔐 Secure Authentication</span>
              <span>🚑 1-Click Ambulance Dispatch</span>
            </div>
          </div>
          <button className="landing-action-btn primary-action">ENTER PUBLIC PORTAL →</button>
        </div>

        {/* Option 2: Hospital Operations Audit Portal */}
        <div className="portal-choice-card hospital-portal" onClick={() => onSelectPortal('HOSPITAL_PORTAL')}>
          <div className="portal-badge badge-hospital">PROTECTED MEDICAL OFFICER ACCESS</div>
          <div className="portal-icon">🏥</div>
          <div className="portal-content">
            <h2>Hospital Admin & Operations Center</h2>
            <p>For Medical Officers & Emergency Staff: Audit ASV vial inventory, update ICU bed capacity, track incoming victims, and monitor regional stock.</p>
            <div className="landing-feature-pills">
              <span>📋 ASV Inventory Audit</span>
              <span>🫁 ICU Bed Capacity</span>
              <span>🚨 Incoming Patient Tracking</span>
            </div>
          </div>
          <button className="landing-action-btn hospital-action">OFFICER LOGIN →</button>
        </div>

      </div>

      <footer className="landing-footer">
        <div>Emergency Medical Assistance: <strong>108 / 15400 (NAPSE)</strong></div>
        <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>
          V-TACS System v2.0 • Real-Time Emergency Triage & ASV Routing Network
        </div>
      </footer>
    </div>
  );
}
