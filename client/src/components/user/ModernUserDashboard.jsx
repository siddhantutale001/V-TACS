import React, { useState, useEffect } from 'react';
import VoiceTriagePanel from '../VoiceTriagePanel';
import PersonalDetailsModal from '../auth/PersonalDetailsModal';
import EmergencyMap from '../map/EmergencyMap';

export default function ModernUserDashboard({ 
  userAuth, 
  userProfile: rawUserProfile, 
  onSaveProfile, 
  onDeleteAccount, 
  onLogout, 
  onParseVoiceTranscript,
  onCalculateMatch,
  matchData,
  selectedHospital,
  onSelectHospital,
  onExecuteDispatch,
  isLoading,
  isDispatching
}) {
  const userProfile = rawUserProfile || {
    fullName: userAuth?.name || 'Emergency Victim',
    phone: 'Not Set',
    emergencyContactName: 'Kin Name Not Set',
    emergencyContactPhone: 'Not Set',
    bloodGroup: 'O+',
    medicalConditions: 'None'
  };

  const [formData, setFormData] = useState({
    victim_lat: '18.7617',
    victim_lon: '73.8587',
    location_description: 'Chakan Market Yard (Rural North)',
    symptoms: userProfile?.medicalConditions ? `Pre-existing: ${userProfile.medicalConditions}` : 'Snakebite envenoming symptoms',
    victim_blood_group: userProfile?.bloodGroup || 'O+',
    victim_medical_history: userProfile?.medicalConditions || '',
    victim_emergency_contact: userProfile?.emergencyContactPhone || '',
    asv_vials_needed: 10,
    requires_ventilator: false
  });

  useEffect(() => {
    if (userProfile) {
      setFormData(prev => ({
        ...prev,
        victim_blood_group: userProfile.bloodGroup || prev.victim_blood_group,
        victim_medical_history: userProfile.medicalConditions || prev.victim_medical_history,
        victim_emergency_contact: userProfile.emergencyContactPhone || prev.victim_emergency_contact
      }));
    }
  }, [userProfile]);

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [geoStatus, setGeoStatus] = useState('');

  // 1-Click GPS Location Auto-Detection
  const handleDetectLocation = () => {
    if ('geolocation' in navigator) {
      setGeoStatus('Detecting GPS location...');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFormData(prev => ({
            ...prev,
            victim_lat: pos.coords.latitude.toFixed(4),
            victim_lon: pos.coords.longitude.toFixed(4),
            location_description: `Current GPS Coordinates (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`
          }));
          setGeoStatus('✓ GPS Location Accurately Locked');
          setTimeout(() => setGeoStatus(''), 4000);
        },
        (err) => {
          console.warn('Geolocation error:', err);
          setGeoStatus('GPS access denied. Using standard coordinates.');
          setTimeout(() => setGeoStatus(''), 4000);
        }
      );
    } else {
      setGeoStatus('Geolocation not supported by device.');
    }
  };

  const handleVoiceData = (parsedData) => {
    if (!parsedData) return;
    setFormData(prev => ({
      ...prev,
      victim_lat: parsedData.estimated_lat ? String(parsedData.estimated_lat) : prev.victim_lat,
      victim_lon: parsedData.estimated_lon ? String(parsedData.estimated_lon) : prev.victim_lon,
      location_description: parsedData.location_description || prev.location_description,
      symptoms: Array.isArray(parsedData.symptoms) ? parsedData.symptoms.join(', ') : (parsedData.symptoms || prev.symptoms),
      asv_vials_needed: parsedData.asv_vials_needed || prev.asv_vials_needed,
      requires_ventilator: Boolean(parsedData.requires_ventilator)
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onCalculateMatch(formData);
  };

  return (
    <div className="modern-dashboard-layout">
      
      {/* Top Emergency Navbar */}
      <header className="modern-header-bar">
        <div className="header-brand-group">
          <div className="header-logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L4 6V12C4 17.52 7.41 22.61 12 24C16.59 22.61 20 17.52 20 12V6L12 2Z" fill="#DC2626"/>
              <path d="M11 7H13V11H17V13H13V17H11V13H7V11H11V7Z" fill="white"/>
            </svg>
          </div>
          <div>
            <div className="brand-title">V-TACS Emergency Victim Portal</div>
            <div className="brand-subtitle">National Action Plan (NAPSE) • 24/7 Rapid Triage Response</div>
          </div>
        </div>

        {/* User Status Bar & Controls */}
        <div className="header-actions-group">
          <div className="user-profile-badge" onClick={() => setShowProfileModal(true)}>
            <div className="avatar-chip">
              {userProfile?.fullName ? userProfile.fullName[0].toUpperCase() : 'U'}
            </div>
            <div className="user-chip-text">
              <div className="chip-name">{userProfile?.fullName || 'Emergency Victim'}</div>
              <div className="chip-phone">{userProfile?.phone || 'No phone set'}</div>
            </div>
          </div>

          <button className="nav-btn edit-profile-btn" onClick={() => setShowProfileModal(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            <span>Edit Profile</span>
          </button>
          
          <button className="nav-btn logout-btn" onClick={onLogout}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            <span>Log Out</span>
          </button>
        </div>
      </header>

      {/* Main Grid: Left & Right Emergency Panels */}
      <div className="dashboard-grid-container">
        
        {/* Left Column: Voice Triage Hero + GPS Coordinates */}
        <div className="dashboard-column">
          
          {/* Unified Voice Triage Hero Card */}
          <div className="dashboard-card voice-hero-panel">
            <div className="panel-header-row">
              <div className="panel-title-group">
                <div className="icon-badge red-badge">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  </svg>
                </div>
                <div>
                  <h2 className="panel-title">Hands-Free Emergency Voice Triage</h2>
                  <p className="panel-desc">Speak naturally or choose a preset. The AI engine will parse your symptoms, location, and antivenom requirement.</p>
                </div>
              </div>
              <span className="live-status-pill">AI ACTIVE</span>
            </div>
            
            <VoiceTriagePanel 
              onApplyParsedData={handleVoiceData}
              onParseVoiceTranscript={onParseVoiceTranscript}
            />
          </div>

          {/* Location & Symptoms Payload Form */}
          <div className="dashboard-card location-form-card">
            <div className="panel-header-row">
              <div className="panel-title-group">
                <div className="icon-badge blue-badge">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0284C7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <div>
                  <h2 className="panel-title">Emergency Location & Envenoming Signs</h2>
                </div>
              </div>

              {/* Distressed User Primary Button: Auto Detect GPS */}
              <button 
                type="button" 
                className="gps-pulse-btn"
                onClick={handleDetectLocation}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="22" y1="12" x2="18" y2="12"/><line x1="6" y1="12" x2="2" y2="12"/><line x1="12" y1="6" x2="12" y2="2"/><line x1="12" y1="22" x2="12" y2="18"/>
                </svg>
                <span>1-CLICK AUTO-DETECT GPS</span>
              </button>
            </div>

            {geoStatus && <div className="geo-feedback-banner">{geoStatus}</div>}

            <form onSubmit={handleFormSubmit} className="triage-form-inner">
              <div className="form-two-col">
                <div className="form-field">
                  <label>Victim Latitude</label>
                  <input 
                    type="text" 
                    value={formData.victim_lat} 
                    onChange={e => setFormData({ ...formData, victim_lat: e.target.value })} 
                    required 
                  />
                </div>
                <div className="form-field">
                  <label>Victim Longitude</label>
                  <input 
                    type="text" 
                    value={formData.victim_lon} 
                    onChange={e => setFormData({ ...formData, victim_lon: e.target.value })} 
                    required 
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Location Description / Landmark</label>
                <input 
                  type="text" 
                  value={formData.location_description} 
                  onChange={e => setFormData({ ...formData, location_description: e.target.value })} 
                  placeholder="Near petrol pump, village junction, agricultural field..." 
                />
              </div>

              <div className="form-field">
                <label>Bite Details & Visible Symptoms</label>
                <textarea 
                  value={formData.symptoms} 
                  onChange={e => setFormData({ ...formData, symptoms: e.target.value })} 
                  rows="2" 
                />
              </div>

              <div className="form-two-col">
                <div className="form-field">
                  <label>Estimated ASV Vials</label>
                  <input 
                    type="number" 
                    value={formData.asv_vials_needed} 
                    onChange={e => setFormData({ ...formData, asv_vials_needed: parseInt(e.target.value, 10) })} 
                    min="1" 
                    max="30" 
                  />
                </div>
                <div className="form-field checkbox-field">
                  <label className="checkbox-container">
                    <input 
                      type="checkbox" 
                      checked={formData.requires_ventilator} 
                      onChange={e => setFormData({ ...formData, requires_ventilator: e.target.checked })} 
                    />
                    <span className="checkbox-label-text">Requires ICU Ventilator</span>
                  </label>
                </div>
              </div>

              {/* Distressed User Critical Call-to-Action */}
              <button type="submit" className="hero-calculate-btn" disabled={isLoading}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
                <span>{isLoading ? 'CALCULATING RAPID ROUTE & ASV STOCKS...' : 'FIND NEAREST EQUIPPED HOSPITAL & AMBULANCE'}</span>
              </button>
            </form>
          </div>

        </div>

        {/* Right Column: Emergency Kin Contact, Live Map & Hospital Result */}
        <div className="dashboard-column">
          
          {/* Emergency Kin Record Banner */}
          <div className="dashboard-card kin-status-card">
            <div className="kin-header-row">
              <div className="kin-icon-chip">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <div>
                <div className="kin-title-label">EMERGENCY KIN CONTACT ON RECORD</div>
                <div className="kin-details-text">
                  <strong>{userProfile?.emergencyContactName || 'Kin Name Not Set'}</strong> • {userProfile?.emergencyContactPhone || 'Not Set'}
                </div>
              </div>
              <div className="kin-blood-pill">
                Blood Group: <strong>{userProfile?.bloodGroup || 'O+'}</strong>
              </div>
            </div>
          </div>

          {/* Interactive Emergency GIS Map */}
          <div className="dashboard-card map-panel-card">
            <div className="map-title-row">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
                <line x1="8" y1="2" x2="8" y2="18"/>
                <line x1="16" y1="6" x2="16" y2="22"/>
              </svg>
              <span>Live Emergency GIS Map (Pune District Network)</span>
            </div>
            <EmergencyMap 
              victimLat={formData.victim_lat}
              victimLon={formData.victim_lon}
              victimLocation={formData.location_description}
              hospitals={matchData?.candidate_hospitals || []}
              matchedHospital={selectedHospital}
              matchedAmbulance={matchData?.matched_ambulance}
            />
          </div>

          {/* Matched Hospital & Immediate Dispatch Card */}
          {selectedHospital ? (
            <div className="dashboard-card matched-hospital-card">
              <div className="matched-card-header">
                <div className="matched-title-box">
                  <div className="hospital-badge-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 21h18"/>
                      <path d="M5 21V7l8-4v18"/>
                      <path d="M19 21V11l-6-3"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="hospital-name-text">{selectedHospital.name}</h3>
                    <p className="hospital-address-text">{selectedHospital.address}</p>
                  </div>
                </div>
                <span className="route-engine-pill">{selectedHospital.engine || 'GIS Smart Route'}</span>
              </div>

              {selectedHospital.is_first_aid_only && (
                <div className="warning-firstaid-box">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  <div>
                    <strong>FIRST AID & STABILIZATION STOP ONLY (NO ASV VIALS)</strong><br/>
                    This primary facility has no ASV vials in stock. Recommended only for immediate airway stabilization while secondary transport is coordinated.
                  </div>
                </div>
              )}
              
              {/* Stat Metric Grid */}
              <div className="hospital-stat-grid">
                <div className="metric-box">
                  <div className="metric-value">{selectedHospital.distance_km} km</div>
                  <div className="metric-label">Direct Distance</div>
                </div>
                <div className="metric-box highlight-metric">
                  <div className="metric-value">{selectedHospital.eta_minutes} MIN</div>
                  <div className="metric-label">Estimated Travel ETA</div>
                </div>
                <div className="metric-box">
                  <div className="metric-value">{selectedHospital.current_asv_vials} Vials</div>
                  <div className="metric-label">Verified ASV Stock</div>
                </div>
              </div>

              {/* Ambulance Assignment Block */}
              <div className="ambulance-dispatch-banner">
                <div className="amb-icon-wrap">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="3" width="15" height="13" rx="2"/>
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                    <circle cx="5.5" cy="18.5" r="2.5"/>
                    <circle cx="18.5" cy="18.5" r="2.5"/>
                  </svg>
                </div>
                <div>
                  <div className="amb-title">Assigned Ambulance: {matchData?.matched_ambulance?.vehicle_number || 'MH-12-EM-1081'}</div>
                  <div className="amb-driver">Driver: {matchData?.matched_ambulance?.driver_name || 'Emergency Dispatch Unit'} ({matchData?.matched_ambulance?.driver_phone || '+91-9822011111'})</div>
                </div>
              </div>

              {/* High-Priority Distressed User Dispatch Action */}
              <div className="dispatch-confirm-container">
                <button 
                  className="ultimate-dispatch-btn"
                  onClick={() => onExecuteDispatch(formData, selectedHospital, matchData?.matched_ambulance)}
                  disabled={isDispatching}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <path d="M9 12l2 2 4-4"/>
                  </svg>
                  <span>{isDispatching ? 'RESERVING ANTIVENOM VIALS...' : 'CONFIRM DISPATCH & RESERVE ANTIVENOM VIALS'}</span>
                </button>
                <div className="dispatch-safety-subtext">
                  Instant reservation locks {formData.asv_vials_needed} ASV vials at {selectedHospital.name} and notifies the emergency ambulance unit.
                </div>
              </div>
            </div>
          ) : (
            <div className="dashboard-card empty-state-card">
              <div className="empty-icon-wrap">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </div>
              <h3>Awaiting Triage Calculation</h3>
              <p>Speak your symptoms into the microphone or lock your GPS coordinates to automatically match the nearest antivenom-equipped hospital.</p>
            </div>
          )}

        </div>

      </div>

      {/* Mandatory Onboarding Modal if Profile Incomplete or Edit requested */}
      {showProfileModal && (
        <PersonalDetailsModal 
          initialDetails={userProfile}
          onSaveDetails={(updated) => {
            onSaveProfile(updated);
            setShowProfileModal(false);
          }}
          onDeleteAccount={onDeleteAccount}
        />
      )}

    </div>
  );
}
