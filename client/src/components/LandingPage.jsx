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
            <p>Hands-Free Conversational Voice Triage powered by Gemini 2.5 Flash LLM. Fast emergency routing, ASV hospital locator, & instant ambulance dispatch.</p>
            <div className="portal-auth-note">
              🔐 User Login / Sign Up via <strong>Clerk Auth</strong>
            </div>
            <button className="portal-btn user-btn">
              ENTER PUBLIC EMERGENCY PORTAL →
            </button>
          </div>

          {/* Card 2: Hospital Administrative Portal */}
          <div className="portal-card hospital-portal-card" onClick={() => onSelectPortal('HOSPITAL_PORTAL')}>
            <div className="portal-icon">🏥</div>
            <h3>Hospital Administrative Portal</h3>
            <p>Utilitarian dashboard for Medical Officers, ASV inventory stock auditing, real-time dispatch management, and regional ICU ventilator monitoring.</p>
            <div className="portal-auth-note">
              🔑 Medical Officer JWT Authentication
            </div>
            <button className="portal-btn hospital-btn">
              ENTER HOSPITAL ADMIN DASHBOARD →
            </button>
          </div>

        </div>

        <div className="landing-footer">
          V-TACS System v2.0 • Powered by OSRM Contraction Hierarchies, Gemini 2.5 Flash & Aiven Cloud MySQL
        </div>
      </div>
    </div>
  );
}
