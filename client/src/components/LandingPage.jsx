import React from 'react';

export default function LandingPage({ onSelectPortal }) {
  return (
    <div className="landing-container">
      <div className="landing-card-wrapper">
        
        {/* Brand Header */}
        <div className="landing-header">
          <div className="landing-brand-badge">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ verticalAlign: 'middle', marginRight: '8px' }}>
              <path d="M12 2L4 6V12C4 17.52 7.41 22.61 12 24C16.59 22.61 20 17.52 20 12V6L12 2Z" fill="#DC2626"/>
              <path d="M11 7H13V11H17V13H13V17H11V13H7V11H11V7Z" fill="white"/>
            </svg>
            <span className="landing-logo-text">V-TACS</span>
          </div>

          <h1 className="landing-title">Venom Treatment & Ambulance Coordination System</h1>
          <p className="landing-subtitle">
            National Action Plan for Prevention & Control of Snakebite Envenoming (NAPSE) India
          </p>
          
          <div className="landing-helpline-pill">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
            <span>NATIONAL HELPLINE TOLL-FREE: <strong>15400 / 108</strong></span>
          </div>
        </div>

        <div className="landing-prompt-title">Select Portal Gateway to Proceed</div>

        {/* Symmetrical 2-Column Portal Grid */}
        <div className="portal-grid">
          
          {/* Card 1: Emergency Victim / Public Citizen Portal */}
          <div className="portal-card user-portal-card" onClick={() => onSelectPortal('USER_PORTAL')}>
            <div>
              <div className="portal-icon-wrapper user-icon-bg">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <path d="M12 8v4"/>
                  <path d="M12 16h.01"/>
                </svg>
              </div>
              <div className="portal-card-header-badge badge-user-tag">PUBLIC CITIZEN ACCESS</div>
              <h2 className="portal-card-heading">Public Emergency Triage</h2>
              <p className="portal-card-description">
                Hands-Free Conversational Voice Triage powered by AI Medical Engine. Real-time ASV hospital matching, instant GPS routing, & 1-click ambulance dispatch.
              </p>

              <div className="portal-feature-list">
                <div className="feature-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  <span>Real-Time ASV Stock Matrix</span>
                </div>
                <div className="feature-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  <span>Hands-Free AI Voice Triage</span>
                </div>
                <div className="feature-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  <span>GPS 1-Click Location Match</span>
                </div>
                <div className="feature-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  <span>108 Ambulance Dispatch Link</span>
                </div>
              </div>
            </div>

            <button className="portal-btn user-btn">
              <span>ENTER PUBLIC EMERGENCY PORTAL</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
          </div>

          {/* Card 2: Hospital Administrative & ASV Operations Portal */}
          <div className="portal-card hospital-portal-card" onClick={() => onSelectPortal('HOSPITAL_PORTAL')}>
            <div>
              <div className="portal-icon-wrapper hospital-icon-bg">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 21h18"/>
                  <path d="M5 21V7l8-4v18"/>
                  <path d="M19 21V11l-6-3"/>
                  <path d="M9 9h1"/>
                  <path d="M9 13h1"/>
                  <path d="M9 17h1"/>
                </svg>
              </div>
              <div className="portal-card-header-badge badge-hospital-tag">PROTECTED MEDICAL OFFICER ACCESS</div>
              <h2 className="portal-card-heading">Hospital Admin & ASV Audit</h2>
              <p className="portal-card-description">
                Dedicated interface for Medical Officers & Emergency Staff: Audit ASV vial inventory, manage ICU bed capacity, track incoming victims, and monitor regional stock.
              </p>

              <div className="portal-feature-list">
                <div className="feature-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0284C7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  <span>ASV Vial Inventory Auditing</span>
                </div>
                <div className="feature-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0284C7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  <span>ICU Ventilator Capacity Monitor</span>
                </div>
                <div className="feature-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0284C7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  <span>Incoming Victim Dispatch Queue</span>
                </div>
                <div className="feature-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0284C7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  <span>Regional Hospital Stock Network</span>
                </div>
              </div>
            </div>

            <button className="portal-btn hospital-btn">
              <span>OFFICER LOGIN & AUDIT CENTER</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
          </div>

        </div>

        {/* Clean Footer */}
        <footer className="landing-footer">
          <div className="landing-footer-primary">
            Emergency Response Coordination • NAPSE National Action Plan Standard
          </div>
          <div className="landing-footer-secondary">
            V-TACS System v2.0 • Real-Time Emergency Triage & ASV Routing Network
          </div>
        </footer>

      </div>
    </div>
  );
}
