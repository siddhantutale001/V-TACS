import React, { useState, useEffect } from 'react';
import { 
  auth, 
  googleProvider, 
  isFirebaseConfigured, 
  signInWithPopup, 
  signInWithPhoneNumber, 
  RecaptchaVerifier,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword 
} from '../../config/firebase';

export default function FirebaseAuthPanel({ onAuthSuccess, onBackToLanding }) {
  const [activeTab, setActiveTab] = useState('GOOGLE'); // GOOGLE, PHONE, EMAIL
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  // Phone OTP state
  const [phone, setPhone] = useState('+91');
  const [otpCode, setOtpCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  // Setup Invisible Recaptcha for Phone Auth
  useEffect(() => {
    if (isFirebaseConfigured && auth && !window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: () => {},
          'expired-callback': () => {
            setError('reCAPTCHA expired. Please try sending OTP again.');
          }
        });
      } catch (err) {
        console.warn('Recaptcha init warning:', err);
      }
    }
  }, []);

  // 1. Google Popup Login
  const handleGoogleLogin = async () => {
    setError('');
    setStatusMessage('');
    if (!isFirebaseConfigured || !auth || !googleProvider) {
      // Demo fallback login if Firebase is not configured yet
      onAuthSuccess({
        id: 'demo_google_123',
        email: 'citizen.victim@gmail.com',
        name: 'Demo Citizen (Google)'
      });
      return;
    }

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      onAuthSuccess({
        id: user.uid,
        email: user.email || 'google.user@gmail.com',
        name: user.displayName || 'Citizen (Google)'
      });
    } catch (err) {
      console.error('Google Sign-In Error:', err);
      setError(err.message || 'Google sign-in failed.');
    }
  };

  // 2. Send Phone SMS OTP
  const handleSendPhoneOtp = async (e) => {
    e.preventDefault();
    setError('');
    setStatusMessage('');

    if (!phone || phone.length < 10) {
      setError('Please enter a valid phone number with country code (e.g. +919876543210)');
      return;
    }

    if (!isFirebaseConfigured || !auth) {
      // Demo fallback phone verification
      setStatusMessage('Demo Mode: OTP sent! Enter 123456 to verify.');
      setConfirmationResult({
        confirm: async (code) => {
          if (code === '123456') {
            return { user: { uid: 'demo_phone_789', phoneNumber: phone } };
          }
          throw new Error('Invalid OTP code. Use 123456 for demo.');
        }
      });
      return;
    }

    setIsSendingOtp(true);
    try {
      const appVerifier = window.recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, phone, appVerifier);
      setConfirmationResult(result);
      setStatusMessage(`✓ SMS OTP sent to ${phone}. Please enter the 6-digit code.`);
    } catch (err) {
      console.error('Phone OTP Error:', err);
      setError(err.message || 'Failed to send SMS OTP. Verify phone number and Firebase config.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // 3. Verify Phone SMS OTP Code
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (!otpCode || otpCode.length < 6) {
      setError('Please enter the full 6-digit OTP code.');
      return;
    }

    if (!confirmationResult) {
      setError('No active OTP request found. Please click Send OTP.');
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const result = await confirmationResult.confirm(otpCode);
      const user = result.user;
      onAuthSuccess({
        id: user.uid,
        email: `${user.phoneNumber}@phone.user`,
        name: `Citizen (${user.phoneNumber})`
      });
    } catch (err) {
      console.error('OTP Verification Error:', err);
      setError('Invalid OTP code. Please check and try again.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // 4. Email / Password Login or Register
  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError('');
    setStatusMessage('');

    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    if (!isFirebaseConfigured || !auth) {
      // Demo fallback login
      onAuthSuccess({
        id: 'demo_email_456',
        email: email,
        name: email.split('@')[0]
      });
      return;
    }

    try {
      let result;
      if (isRegistering) {
        result = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        result = await signInWithEmailAndPassword(auth, email, password);
      }
      const user = result.user;
      onAuthSuccess({
        id: user.uid,
        email: user.email,
        name: user.email ? user.email.split('@')[0] : 'Citizen'
      });
    } catch (err) {
      console.error('Email Auth Error:', err);
      setError(err.message || 'Authentication failed. Check credentials.');
    }
  };

  return (
    <div className="landing-container">
      <div className="landing-card-wrapper" style={{ maxWidth: '520px' }}>
        <button className="back-btn" onClick={onBackToLanding}>← Back to Gateway</button>

        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h2 style={{ color: '#E63946', margin: '4px 0', fontSize: '22px' }}>
            🔥 Public Emergency Victim Authentication
          </h2>
          <p style={{ fontSize: '12px', color: '#64748B', margin: '4px 0 0 0' }}>
            Powered by Firebase Authentication (Google, Phone SMS OTP, Email)
          </p>
        </div>

        {/* Tab Selection */}
        <div style={{ display: 'flex', gap: '4px', background: '#F1F5F9', padding: '4px', borderRadius: '10px', marginBottom: '20px' }}>
          <button 
            type="button"
            onClick={() => { setActiveTab('GOOGLE'); setError(''); setStatusMessage(''); }}
            style={{ 
              flex: 1, 
              padding: '8px', 
              fontSize: '12px', 
              fontWeight: 'bold', 
              borderRadius: '8px', 
              border: 'none', 
              cursor: 'pointer',
              background: activeTab === 'GOOGLE' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'GOOGLE' ? '#1E293B' : '#64748B',
              boxShadow: activeTab === 'GOOGLE' ? '0 2px 4px rgba(0,0,0,0.08)' : 'none'
            }}
          >
            🌐 Google
          </button>
          <button 
            type="button"
            onClick={() => { setActiveTab('PHONE'); setError(''); setStatusMessage(''); }}
            style={{ 
              flex: 1, 
              padding: '8px', 
              fontSize: '12px', 
              fontWeight: 'bold', 
              borderRadius: '8px', 
              border: 'none', 
              cursor: 'pointer',
              background: activeTab === 'PHONE' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'PHONE' ? '#1E293B' : '#64748B',
              boxShadow: activeTab === 'PHONE' ? '0 2px 4px rgba(0,0,0,0.08)' : 'none'
            }}
          >
            📱 Phone OTP
          </button>
          <button 
            type="button"
            onClick={() => { setActiveTab('EMAIL'); setError(''); setStatusMessage(''); }}
            style={{ 
              flex: 1, 
              padding: '8px', 
              fontSize: '12px', 
              fontWeight: 'bold', 
              borderRadius: '8px', 
              border: 'none', 
              cursor: 'pointer',
              background: activeTab === 'EMAIL' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'EMAIL' ? '#1E293B' : '#64748B',
              boxShadow: activeTab === 'EMAIL' ? '0 2px 4px rgba(0,0,0,0.08)' : 'none'
            }}
          >
            ✉️ Email
          </button>
        </div>

        {!isFirebaseConfigured && (
          <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#1E40AF', padding: '10px', borderRadius: '8px', fontSize: '11px', marginBottom: '16px' }}>
            💡 <strong>Firebase Auth Ready:</strong> Add <code>VITE_FIREBASE_API_KEY</code> to <code>client/.env</code> to activate live Firebase SMS OTP & Google Popup login. Click any button below for instant demo login!
          </div>
        )}

        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', marginBottom: '16px', fontWeight: 'bold' }}>
            ⚠️ {error}
          </div>
        )}

        {statusMessage && (
          <div style={{ background: '#F0FDF4', border: '1px solid #86EFAC', color: '#166534', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', marginBottom: '16px', fontWeight: 'bold' }}>
            {statusMessage}
          </div>
        )}

        {/* ----------------- TAB 1: GOOGLE SIGN-IN ----------------- */}
        {activeTab === 'GOOGLE' && (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <p style={{ fontSize: '13px', color: '#475569', marginBottom: '20px' }}>
              Sign in instantly using your Google account to access emergency triage.
            </p>
            <button 
              type="button" 
              onClick={handleGoogleLogin}
              style={{ 
                width: '100%', 
                padding: '14px', 
                background: '#4285F4', 
                color: '#FFFFFF', 
                border: 'none', 
                borderRadius: '8px', 
                fontWeight: 'bold', 
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                boxShadow: '0 4px 6px rgba(66, 133, 244, 0.25)'
              }}
            >
              <span style={{ background: '#FFF', color: '#4285F4', padding: '2px 6px', borderRadius: '4px', fontWeight: '900' }}>G</span>
              SIGN IN WITH GOOGLE
            </button>
          </div>
        )}

        {/* ----------------- TAB 2: PHONE SMS OTP ----------------- */}
        {activeTab === 'PHONE' && (
          <div>
            <div id="recaptcha-container"></div>

            {!confirmationResult ? (
              <form onSubmit={handleSendPhoneOtp}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontWeight: 'bold', fontSize: '12px', marginBottom: '4px', color: '#334155' }}>
                    Enter Phone Number (with Country Code +91):
                  </label>
                  <input 
                    type="tel" 
                    value={phone} 
                    onChange={e => setPhone(e.target.value)} 
                    placeholder="+919876543210" 
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '14px', fontFamily: 'monospace', fontWeight: 'bold' }} 
                    required 
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={isSendingOtp}
                  style={{ width: '100%', padding: '14px', background: '#0284C7', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}
                >
                  {isSendingOtp ? 'Sending SMS OTP...' : '📲 SEND 6-DIGIT SMS OTP'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontWeight: 'bold', fontSize: '12px', marginBottom: '4px', color: '#334155' }}>
                    Enter 6-Digit SMS OTP Code:
                  </label>
                  <input 
                    type="text" 
                    value={otpCode} 
                    onChange={e => setOtpCode(e.target.value)} 
                    placeholder="123456" 
                    maxLength="6"
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #0284C7', fontSize: '18px', textAlign: 'center', letterSpacing: '6px', fontFamily: 'monospace', fontWeight: 'bold' }} 
                    required 
                  />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    type="submit" 
                    disabled={isVerifyingOtp}
                    style={{ flex: 1, padding: '14px', background: '#16A34A', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}
                  >
                    {isVerifyingOtp ? 'Verifying Code...' : '✓ VERIFY OTP & PROCEED'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => { setConfirmationResult(null); setOtpCode(''); }}
                    style={{ padding: '14px', background: '#E2E8F0', color: '#334155', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}
                  >
                    RESET
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ----------------- TAB 3: EMAIL / PASSWORD ----------------- */}
        {activeTab === 'EMAIL' && (
          <form onSubmit={handleEmailAuth}>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', fontSize: '12px', marginBottom: '4px', color: '#334155' }}>
                Email Address
              </label>
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder="citizen@example.com" 
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '13px' }} 
                required 
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', fontSize: '12px', marginBottom: '4px', color: '#334155' }}>
                Password
              </label>
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="••••••••" 
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '13px' }} 
                required 
              />
            </div>

            <button 
              type="submit" 
              style={{ width: '100%', padding: '12px', background: '#E63946', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}
            >
              {isRegistering ? 'CREATE ACCOUNT & PROCEED →' : 'SIGN IN WITH EMAIL →'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '12px' }}>
              {isRegistering ? (
                <span>Already registered? <a href="#login" onClick={(e) => { e.preventDefault(); setIsRegistering(false); }} style={{ color: '#2563EB', fontWeight: 'bold' }}>Sign In</a></span>
              ) : (
                <span>New user? <a href="#register" onClick={(e) => { e.preventDefault(); setIsRegistering(true); }} style={{ color: '#2563EB', fontWeight: 'bold' }}>Register Account</a></span>
              )}
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
