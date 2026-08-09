import React, { useState } from 'react';
import { ClerkProvider, SignedIn, SignedOut, SignIn, SignUp, UserButton, useUser, useClerk } from '@clerk/clerk-react';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

export function ClerkWrapper({ children }) {
  if (!PUBLISHABLE_KEY) {
    // Demo fallback mode when Clerk Publishable Key is not configured
    return <>{children}</>;
  }

  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      {children}
    </ClerkProvider>
  );
}

export function ClerkAuthPanel({ onAuthSuccess, onBackToLanding }) {
  const [authMode, setAuthMode] = useState('SIGN_IN'); // SIGN_IN vs SIGN_UP

  if (!PUBLISHABLE_KEY) {
    // Demo authentication fallback UI
    return (
      <div className="landing-container">
        <div className="landing-card-wrapper" style={{ maxWidth: '480px' }}>
          <button className="back-btn" onClick={onBackToLanding}>← Back to Gateway</button>
          
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <h2 style={{ color: '#E63946', margin: '8px 0' }}>🔐 Public Emergency User Authentication</h2>
            <p style={{ fontSize: '13px', color: '#4A5568' }}>
              Sign in or create your emergency citizen account to access Gemini 2.5 Flash voice triage.
            </p>
          </div>

          <div style={{ backgroundColor: '#EDF2F7', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '12px' }}>
            💡 <strong>Clerk Auth Integration Ready</strong><br/>
            (Set <code>VITE_CLERK_PUBLISHABLE_KEY</code> in <code>client/.env</code> for live Clerk SSO).
          </div>

          <form onSubmit={(e) => {
            e.preventDefault();
            const email = e.target.email.value || 'user@example.com';
            onAuthSuccess({ id: 'user_demo_101', email, name: email.split('@')[0] });
          }}>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', fontSize: '12px', marginBottom: '4px' }}>Email Address / Phone</label>
              <input 
                type="email" 
                name="email" 
                placeholder="citizen@example.com" 
                defaultValue="citizen@example.com" 
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E0' }} 
                required 
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', fontSize: '12px', marginBottom: '4px' }}>Password</label>
              <input 
                type="password" 
                name="password" 
                placeholder="••••••••" 
                defaultValue="password123" 
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E0' }} 
                required 
              />
            </div>

            <button type="submit" className="portal-btn user-btn" style={{ width: '100%', padding: '12px' }}>
              {authMode === 'SIGN_IN' ? 'SIGN IN & CONTINUE →' : 'CREATE ACCOUNT & CONTINUE →'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '12px' }}>
            {authMode === 'SIGN_IN' ? (
              <span>Don't have an account? <a href="#signup" onClick={(e) => { e.preventDefault(); setAuthMode('SIGN_UP'); }} style={{ color: '#3182CE', fontWeight: 'bold' }}>Sign Up</a></span>
            ) : (
              <span>Already have an account? <a href="#signin" onClick={(e) => { e.preventDefault(); setAuthMode('SIGN_IN'); }} style={{ color: '#3182CE', fontWeight: 'bold' }}>Sign In</a></span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="landing-container">
      <div className="landing-card-wrapper" style={{ maxWidth: '480px' }}>
        <button className="back-btn" onClick={onBackToLanding}>← Back to Gateway</button>
        <SignedOut>
          {authMode === 'SIGN_IN' ? <SignIn /> : <SignUp />}
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </div>
  );
}
