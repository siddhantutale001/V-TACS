import React, { useState, useEffect } from 'react';
import VoiceTriagePanel from '../VoiceTriagePanel';
import PersonalDetailsModal from '../auth/PersonalDetailsModal';
import EmergencyMap from '../map/EmergencyMap';

export default function ModernUserDashboard({ 
  userAuth, 
  userProfile, 
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

  // Auto-fill form data when userProfile changes
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
          setGeoStatus('✓ GPS Location Detected');
          setTimeout(() => setGeoStatus(''), 4000);
        },
        (err) => {
          console.warn('Geolocation error:', err);
          setGeoStatus('⚠️ GPS access denied. Using default location.');
          setTimeout(() => setGeoStatus(''), 4000);
        }
      );
    } else {
      setGeoStatus('⚠️ Geolocation not supported by browser.');
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
    <div className="modern-dashboard">
      
      {/* Modern App Header */}
      <header className="modern-header">
        <div className="modern-header-brand">
          <div className="modern-logo">🐍 V-TACS</div>
          <div>
            <h1>Emergency Victim Triage Portal</h1>
            <div className="modern-subtitle">NAPSE 15400 Helpline • Gemini 2.5 Flash AI Engine</div>
          </div>
        </div>

        {/* User Profile Bar & Actions */}
        <div className="modern-user-menu">
          <div className="user-profile-info" onClick={() => setShowProfileModal(true)}>
            <div className="avatar-circle">
              {userProfile?.fullName ? userProfile.fullName[0].toUpperCase() : 'U'}
            </div>
            <div>
              <div className="user-name">{userProfile?.fullName || 'Emergency Victim'}</div>
              <div className="user-contact">📞 {userProfile?.phone || 'No phone set'}</div>
            </div>
          </div>

          <button className="modern-btn btn-secondary" onClick={() => setShowProfileModal(true)}>
            ⚙️ Edit Profile
          </button>
          
          <button className="modern-btn btn-danger" onClick={onLogout}>
            🚪 Log Out
          </button>
        </div>
      </header>

      {/* Main Interactive Grid */}
      <div className="modern-container">
        
        {/* Left Column: Voice Hero & Simplified Triage */}
        <div className="modern-column">
          
          {/* Voice Triage Hero Card */}
          <div className="modern-card hero-voice-card">
            <div className="card-header">
              <h2>🎤 Voice-Activated Emergency Triage</h2>
              <span className="badge-pill pill-ai">GEMINI 2.5 FLASH LLM</span>
            </div>
            <p className="card-desc">
              Speak naturally into your microphone describing the snakebite, symptoms, and location. Gemini 2.5 Flash will automatically analyze and populate your triage payload.
            </p>
            
            <VoiceTriagePanel 
              onApplyParsedData={handleVoiceData}
              onParseVoiceTranscript={onParseVoiceTranscript}
            />
          </div>

          {/* Location & Symptoms Card */}
          <div className="modern-card">
            <div className="card-header">
              <h2>📍 Location & Symptom Payload</h2>
              <button className="modern-btn btn-gps" onClick={handleDetectLocation}>
                📍 Auto-Detect My Location
              </button>
            </div>

            {geoStatus && <div className="geo-status-banner">{geoStatus}</div>}

            <form onSubmit={handleFormSubmit} className="modern-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Latitude</label>
                  <input 
                    type="text" 
                    value={formData.victim_lat} 
                    onChange={e => setFormData({ ...formData, victim_lat: e.target.value })} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Longitude</label>
                  <input 
                    type="text" 
                    value={formData.victim_lon} 
                    onChange={e => setFormData({ ...formData, victim_lon: e.target.value })} 
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Location Landmark Description</label>
                <input 
                  type="text" 
                  value={formData.location_description} 
                  onChange={e => setFormData({ ...formData, location_description: e.target.value })} 
                  placeholder="Near petrol pump, highway junction..." 
                />
              </div>

              <div className="form-group">
                <label>Symptoms & Envenoming Signs</label>
                <textarea 
                  value={formData.symptoms} 
                  onChange={e => setFormData({ ...formData, symptoms: e.target.value })} 
                  rows="2" 
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>ASV Vials Required</label>
                  <input 
                    type="number" 
                    value={formData.asv_vials_needed} 
                    onChange={e => setFormData({ ...formData, asv_vials_needed: parseInt(e.target.value, 10) })} 
                    min="1" 
                    max="30" 
                  />
                </div>
                <div className="form-group" style={{ display: 'flex', alignItems: 'center', paddingTop: '20px' }}>
                  <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input 
                      type="checkbox" 
                      checked={formData.requires_ventilator} 
                      onChange={e => setFormData({ ...formData, requires_ventilator: e.target.checked })} 
                      style={{ width: '20px', height: '20px' }}
                    />
                    <strong>Requires ICU Ventilator</strong>
                  </label>
                </div>
              </div>

              <button type="submit" className="modern-btn btn-primary-lg" disabled={isLoading}>
                {isLoading ? 'Calculating Emergency Routing Matrix...' : '⚡ FIND NEAREST EQUIPPED HOSPITAL & AMBULANCE'}
              </button>
            </form>
          </div>

        </div>

        {/* Right Column: Matched Hospital & Dispatch Control */}
        <div className="modern-column">
          
          {/* Emergency Contact Quick Card */}
          <div className="modern-card emergency-kin-card">
            <div className="kin-title">🚨 Emergency Kin Contact on Record</div>
            <div className="kin-details">
              <strong>{userProfile?.emergencyContactName || 'Kin Name Not Set'}</strong> • {userProfile?.emergencyContactPhone || 'Not Set'}
            </div>
            <div className="kin-blood">Blood Group: <span>{userProfile?.bloodGroup || 'O+'}</span></div>
          </div>

          {/* Live Interactive GIS Map Visualizer */}
          <div className="modern-card" style={{ padding: '12px', marginBottom: '16px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#0F172A', marginBottom: '10px' }}>
              🗺 Interactive Emergency Map (OpenStreetMap)
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

          {/* Matched Hospital & Ambulance Card */}
          {selectedHospital ? (
            <div className="modern-card match-result-card">
              <div className="card-header">
                <h2>🏥 Matched Hospital & Route</h2>
                <span className="badge-pill pill-routing">{selectedHospital.engine || 'OSRM Matrix'}</span>
              </div>

              <div className="hospital-highlight-box">
                <h3>{selectedHospital.name}</h3>
                <p>{selectedHospital.address}</p>

                {selectedHospital.is_first_aid_only && (
                  <div style={{ backgroundColor: '#FEF2F2', border: '2px solid #EF4444', color: '#991B1B', padding: '10px 12px', fontSize: '12px', fontWeight: 'bold', borderRadius: '8px', marginBottom: '12px', lineHeight: '1.4' }}>
                    🚨 <strong>FIRST AID & STABILIZATION STOP ONLY (NO ASV VIALS)</strong><br/>
                    This unregistered PHC facility does NOT have antivenom vials in stock. Recommended ONLY as a worst-case emergency stop for immediate CPR, airway stabilization, and local first aid while secondary transport to a Tier 1 hospital is arranged.
                  </div>
                )}
                
                <div className="stat-grid">
                  <div className="stat-box">
                    <div className="stat-val">{selectedHospital.distance_km} km</div>
                    <div className="stat-lbl">Distance</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-val">{selectedHospital.eta_minutes} min</div>
                    <div className="stat-lbl">Travel ETA</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-val">{selectedHospital.current_asv_vials}</div>
                    <div className="stat-lbl">ASV Stock</div>
                  </div>
                </div>
              </div>

              <div className="ambulance-highlight-box">
                <div style={{ fontWeight: 'bold', fontSize: '13px' }}>
                  🚑 Assigned Ambulance: {matchData?.matched_ambulance?.vehicle_number || 'MH-12-EM-1081'}
                </div>
                <div style={{ fontSize: '12px', color: '#4A5568' }}>
                  Driver: {matchData?.matched_ambulance?.driver_name || 'Emergency Helpline 15400'} ({matchData?.matched_ambulance?.driver_phone || '+91-9822011111'})
                </div>
              </div>

              {/* Deterministic Action Button */}
              <div className="dispatch-action-area">
                <div className="safety-note">
                  🔒 Manual Button Authorization Required to Reserve ASV Stock & Trigger Dispatch.
                </div>
                <button 
                  className="modern-btn btn-danger-lg"
                  onClick={() => onExecuteDispatch(formData, selectedHospital, matchData?.matched_ambulance)}
                  disabled={isDispatching}
                >
                  {isDispatching ? 'Reserving ASV Stock...' : '🚨 CONFIRM DISPATCH & RESERVE ASV VIALS'}
                </button>
              </div>
            </div>
          ) : (
            <div className="modern-card empty-match-card">
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🚑</div>
              <h3>Awaiting Triage Calculation</h3>
              <p>Speak your symptoms into the microphone or fill your coordinates to match nearest equipped hospital & ambulance.</p>
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
