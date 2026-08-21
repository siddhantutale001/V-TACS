import React, { useState } from 'react';
import { loginUser } from '../../services/api';

const REGISTERED_FACILITIES = [
  {
    code: 'HOSP-YCM-01',
    name: 'YCM Hospital (Yashwantrao Chavan Memorial)',
    username: 'officer_ycm',
    council: 'MMC-2018-0912',
    pass: 'Ycm@Pass2026'
  },
  {
    code: 'HOSP-SGH-02',
    name: 'Sassoon General Hospital (Apex Trauma)',
    username: 'officer_sassoon',
    council: 'MMC-2019-1425',
    pass: 'Sgh@Pass2026'
  },
  {
    code: 'HOSP-CKN-03',
    name: 'Chakan Rural Hospital & Trauma Unit',
    username: 'officer_chakan',
    council: 'MMC-2020-2841',
    pass: 'Ckn@Pass2026'
  },
  {
    code: 'HOSP-ALN-04',
    name: 'Alandi Primary Health Center (PHC)',
    username: 'officer_alandi',
    council: 'MMC-2021-3914',
    pass: 'Aln@Pass2026'
  },
  {
    code: 'HOSP-SHR-05',
    name: 'Shirur Sub-District Hospital',
    username: 'officer_shirur',
    council: 'MMC-2017-0582',
    pass: 'Shr@Pass2026'
  }
];

export default function HospitalLoginModal({ onLoginSuccess, onBackToLanding }) {
  const [facilityCode, setFacilityCode] = useState(REGISTERED_FACILITIES[0].code);
  const [username, setUsername] = useState(REGISTERED_FACILITIES[0].username);
  const [councilNumber, setCouncilNumber] = useState(REGISTERED_FACILITIES[0].council);
  const [password, setPassword] = useState(REGISTERED_FACILITIES[0].pass);
  
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectFacilityPreset = (facility) => {
    setFacilityCode(facility.code);
    setUsername(facility.username);
    setCouncilNumber(facility.council);
    setPassword(facility.pass);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const res = await loginUser({
        facility_code: facilityCode,
        username: username,
        council_reg_number: councilNumber,
        password: password
      });

      if (res && res.success) {
        onLoginSuccess(res.user, res.token);
      } else {
        setError(res?.error || 'Invalid credentials. Please verify facility code and council registration.');
      }
    } catch (err) {
      setError('Authentication failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card" style={{ maxWidth: '500px', backgroundColor: '#C0C0C0', border: '2px outset #FFFFFF', boxShadow: '4px 4px 0px #000000', padding: '6px' }}>
        
        {/* Retro Windows Titlebar */}
        <div style={{ background: '#000080', color: '#FFFFFF', padding: '4px 8px', fontWeight: 'bold', fontSize: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span>🔒 MEDICAL OFFICER AUTHENTICATION GATEWAY</span>
          <span style={{ fontSize: '10px', background: '#C0C0C0', color: '#000', padding: '1px 4px', border: '1px outset #FFF' }}>V-TACS SECURE</span>
        </div>

        <div style={{ padding: '8px' }}>
          <div style={{ fontSize: '11px', fontFamily: 'monospace', color: '#000', background: '#E2E8F0', padding: '6px 8px', border: '1px inset #808080', marginBottom: '12px', lineHeight: '1.4' }}>
            <strong>NAPSE PROTOCOL ACCESS CONTROL:</strong><br/>
            Restricted to verified medical officers. Login assigns your session strictly to your hospital facility code.
          </div>

          {/* Quick Facility Selector */}
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', fontSize: '11px', color: '#000', marginBottom: '4px' }}>
              Select Registered Hospital Facility:
            </label>
            <select 
              value={facilityCode}
              onChange={(e) => {
                const fac = REGISTERED_FACILITIES.find(f => f.code === e.target.value);
                if (fac) handleSelectFacilityPreset(fac);
              }}
              style={{ width: '100%', padding: '6px', border: '2px inset #808080', fontSize: '11.5px', fontFamily: 'sans-serif', background: '#FFF' }}
            >
              {REGISTERED_FACILITIES.map(f => (
                <option key={f.code} value={f.code}>
                  [{f.code}] {f.name}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div style={{ background: '#800000', color: '#FFF', padding: '6px', fontSize: '11px', fontFamily: 'monospace', marginBottom: '10px' }}>
              [ERROR: {error}]
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '10px', color: '#000', marginBottom: '2px' }}>
                  Facility Code:
                </label>
                <input 
                  type="text" 
                  value={facilityCode} 
                  onChange={e => setFacilityCode(e.target.value)} 
                  placeholder="HOSP-YCM-01" 
                  style={{ width: '100%', padding: '4px 6px', border: '2px inset #808080', fontFamily: 'monospace', fontSize: '11px', background: '#FFF' }}
                  required 
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '10px', color: '#000', marginBottom: '2px' }}>
                  Officer Username:
                </label>
                <input 
                  type="text" 
                  value={username} 
                  onChange={e => setUsername(e.target.value)} 
                  placeholder="officer_ycm" 
                  style={{ width: '100%', padding: '4px 6px', border: '2px inset #808080', fontFamily: 'monospace', fontSize: '11px', background: '#FFF' }}
                  required 
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '8px', marginBottom: '12px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '10px', color: '#000', marginBottom: '2px' }}>
                  Medical Council Reg No (Badge):
                </label>
                <input 
                  type="text" 
                  value={councilNumber} 
                  onChange={e => setCouncilNumber(e.target.value)} 
                  placeholder="MMC-2018-0912" 
                  style={{ width: '100%', padding: '4px 6px', border: '2px inset #808080', fontFamily: 'monospace', fontSize: '11px', background: '#FFF' }}
                  required 
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '10px', color: '#000', marginBottom: '2px' }}>
                  Password / PIN:
                </label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  placeholder="••••••••" 
                  style={{ width: '100%', padding: '4px 6px', border: '2px inset #808080', fontFamily: 'monospace', fontSize: '11px', background: '#FFF' }}
                  required 
                />
              </div>
            </div>

            {/* Quick Demo Pre-Fill Buttons */}
            <div style={{ background: '#FFFFE0', border: '1px solid #808080', padding: '6px', fontSize: '10px', fontFamily: 'monospace', marginBottom: '12px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>⚡ 1-CLICK HOSPITAL CREDENTIAL PRESETS:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {REGISTERED_FACILITIES.map(f => (
                  <button 
                    key={f.code}
                    type="button" 
                    onClick={() => handleSelectFacilityPreset(f)}
                    style={{ fontSize: '9.5px', padding: '2px 5px', cursor: 'pointer', background: facilityCode === f.code ? '#000080' : '#E2E8F0', color: facilityCode === f.code ? '#FFF' : '#000', border: '1px outset #FFF' }}
                  >
                    {f.code}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                type="submit" 
                style={{ flex: 1, padding: '8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', background: '#000080', color: '#FFF', border: '2px outset #FFF' }}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'AUTHENTICATING FACILITY...' : '🔓 AUTHORIZE & OPEN HOSPITAL DASHBOARD'}
              </button>
              <button 
                type="button" 
                onClick={onBackToLanding}
                style={{ padding: '8px 14px', fontSize: '11px', cursor: 'pointer', background: '#C0C0C0', border: '2px outset #FFF' }}
              >
                CANCEL
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
