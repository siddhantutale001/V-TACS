import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import { ClerkAuthPanel, ClerkWrapper } from './components/auth/ClerkUserAuth';
import PersonalDetailsModal from './components/auth/PersonalDetailsModal';
import HospitalLoginModal from './components/auth/HospitalLoginModal';
import ModernUserDashboard from './components/user/ModernUserDashboard';
import HospitalDashboard from './components/hospital/HospitalDashboard';
import { 
  calculateTriageMatch, 
  parseVoiceTranscript, 
  executeDispatch 
} from './services/api';

export default function App() {
  // Screens: LANDING, USER_AUTH, USER_DASHBOARD, HOSPITAL_LOGIN, HOSPITAL_DASHBOARD
  const [currentScreen, setCurrentScreen] = useState('LANDING');
  
  const [userAuth, setUserAuth] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [officerUser, setOfficerUser] = useState(null);
  const [showMandatoryOnboarding, setShowMandatoryOnboarding] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const [matchData, setMatchData] = useState(null);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);

  // Load saved user profile from LocalStorage on initial mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('vtacs_user_profile');
    if (savedProfile) {
      try {
        setUserProfile(JSON.parse(savedProfile));
      } catch (err) {
        console.warn('Failed to parse saved profile:', err);
      }
    }
  }, []);

  // Handle portal selection from Landing Page
  const handleSelectPortal = (portalType) => {
    if (portalType === 'HOSPITAL_PORTAL') {
      if (officerUser) {
        setCurrentScreen('HOSPITAL_DASHBOARD');
      } else {
        setCurrentScreen('HOSPITAL_LOGIN');
      }
    } else if (portalType === 'USER_PORTAL') {
      if (userAuth) {
        setCurrentScreen('USER_DASHBOARD');
      } else {
        setCurrentScreen('USER_AUTH');
      }
    }
  };

  // Hospital Officer Login Success Handler
  const handleOfficerLoginSuccess = (user, token) => {
    setOfficerUser(user);
    setCurrentScreen('HOSPITAL_DASHBOARD');
  };

  // User auth success handler
  const handleAuthSuccess = (authDetails) => {
    setUserAuth(authDetails);
    const saved = localStorage.getItem('vtacs_user_profile');
    if (!saved) {
      setShowMandatoryOnboarding(true);
    }
    setCurrentScreen('USER_DASHBOARD');
  };

  // Save profile handler
  const handleSaveProfile = (profileData) => {
    setUserProfile(profileData);
    localStorage.setItem('vtacs_user_profile', JSON.stringify(profileData));
    setShowMandatoryOnboarding(false);
  };

  // User logout handler
  const handleUserLogout = () => {
    setUserAuth(null);
    setCurrentScreen('LANDING');
  };

  // Officer logout handler
  const handleOfficerLogout = () => {
    setOfficerUser(null);
    setCurrentScreen('LANDING');
  };

  // Delete Account handler
  const handleDeleteAccount = () => {
    setIsDeletingAccount(true);
    setTimeout(() => {
      setUserAuth(null);
      setUserProfile(null);
      localStorage.removeItem('vtacs_user_profile');
      setShowMandatoryOnboarding(false);
      setIsDeletingAccount(false);
      setCurrentScreen('LANDING');
      alert('Your account and personal profile have been permanently deleted.');
    }, 1000);
  };

  // Calculate triage match
  const handleCalculateMatch = async (formData) => {
    setIsLoading(true);
    try {
      const res = await calculateTriageMatch(formData);
      if (res && res.success && res.data) {
        setMatchData(res.data);
        setSelectedHospital(res.data.matched_hospital);
      }
    } catch (err) {
      console.error('Match calculation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Execute emergency dispatch
  const handleExecuteDispatch = async (formData, hospital, ambulance) => {
    if (!hospital) return;
    setIsDispatching(true);
    try {
      const payload = {
        victim_lat: parseFloat(formData.victim_lat),
        victim_lon: parseFloat(formData.victim_lon),
        location_description: formData.location_description,
        symptoms: formData.symptoms,
        hospital_id: hospital.id,
        ambulance_id: ambulance ? ambulance.id : null,
        estimated_eta: matchData?.total_estimated_eta_minutes || hospital.eta_minutes,
        asv_vials_reserved: formData.asv_vials_needed
      };

      const res = await executeDispatch(payload);
      if (res && res.success) {
        alert(`🚨 DISPATCH EXECUTED & RESERVED ${res.asv_vials_reserved} ASV VIALS AT ${res.hospital_name}`);
      }
    } catch (err) {
      console.error('Dispatch execution error:', err);
      alert('Failed to execute dispatch transaction.');
    } finally {
      setIsDispatching(false);
    }
  };

  return (
    <ClerkWrapper>
      {/* 1. Landing Gateway Screen */}
      {currentScreen === 'LANDING' && (
        <LandingPage onSelectPortal={handleSelectPortal} />
      )}

      {/* 2. Clerk User Authentication Gateway */}
      {currentScreen === 'USER_AUTH' && (
        <ClerkAuthPanel 
          onAuthSuccess={handleAuthSuccess}
          onBackToLanding={() => setCurrentScreen('LANDING')}
        />
      )}

      {/* 3. Hospital Medical Officer Authentication Gateway */}
      {currentScreen === 'HOSPITAL_LOGIN' && (
        <HospitalLoginModal 
          onLoginSuccess={handleOfficerLoginSuccess}
          onBackToLanding={() => setCurrentScreen('LANDING')}
        />
      )}

      {/* 4. Modern Public Citizen Emergency Dashboard */}
      {currentScreen === 'USER_DASHBOARD' && (
        <>
          <ModernUserDashboard 
            userAuth={userAuth}
            userProfile={userProfile}
            onSaveProfile={handleSaveProfile}
            onDeleteAccount={handleDeleteAccount}
            onLogout={handleUserLogout}
            onParseVoiceTranscript={parseVoiceTranscript}
            onCalculateMatch={handleCalculateMatch}
            matchData={matchData}
            selectedHospital={selectedHospital}
            onSelectHospital={setSelectedHospital}
            onExecuteDispatch={handleExecuteDispatch}
            isLoading={isLoading}
            isDispatching={isDispatching}
          />

          {/* Mandatory onboarding modal if user has not completed details */}
          {(showMandatoryOnboarding || !userProfile) && (
            <PersonalDetailsModal 
              initialDetails={userProfile}
              onSaveDetails={handleSaveProfile}
              onDeleteAccount={handleDeleteAccount}
              isDeleting={isDeletingAccount}
            />
          )}
        </>
      )}

      {/* 5. Hospital Resource Operations & ASV Audit Center */}
      {currentScreen === 'HOSPITAL_DASHBOARD' && (
        <HospitalDashboard 
          officerUser={officerUser}
          onLogout={handleOfficerLogout}
          onBackToLanding={() => setCurrentScreen('LANDING')}
        />
      )}
    </ClerkWrapper>
  );
}
