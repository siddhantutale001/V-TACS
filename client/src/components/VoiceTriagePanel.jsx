import React, { useState } from 'react';
import { useVoiceTriage } from '../hooks/useVoiceTriage';

export default function VoiceTriagePanel({ onApplyParsedData, onParseVoiceTranscript }) {
  const [isParsing, setIsParsing] = useState(false);
  const [manualText, setManualText] = useState('');
  const [apiKeyError, setApiKeyError] = useState('');

  const handleParseText = async (textToParse) => {
    const targetText = textToParse || manualText || transcript;
    if (!targetText || !targetText.trim()) {
      alert('Please enter or speak emergency symptoms first.');
      return;
    }
    setIsParsing(true);
    setApiKeyError('');
    try {
      const parsedResult = await onParseVoiceTranscript(targetText);
      if (parsedResult && parsedResult.error === 'GEMINI_API_KEY_MISSING') {
        setApiKeyError(parsedResult.message || 'AI service key is missing in server configuration.');
        return;
      }
      if (parsedResult && parsedResult.data) {
        onApplyParsedData(parsedResult.data);
      }
    } catch (err) {
      console.error('Voice parsing error:', err);
    } finally {
      setIsParsing(false);
    }
  };

  const {
    isListening,
    transcript,
    setTranscript,
    errorMessage,
    startListening,
    stopListeningAndParse
  } = useVoiceTriage((parsedText) => handleParseText(parsedText));

  const applyPreset = (presetText) => {
    setManualText(presetText);
    setTranscript(presetText);
    handleParseText(presetText);
  };

  return (
    <div className="voice-triage-inner">
      
      {/* Mic Trigger - Massive Panic-Friendly Emergency Button */}
      <div style={{ marginBottom: '16px' }}>
        {!isListening ? (
          <button 
            type="button"
            className="emergency-pulse-btn mic-start-btn"
            onClick={startListening}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="23"/>
              <line x1="8" y1="23" x2="16" y2="23"/>
            </svg>
            <span>TAP TO SPEAK EMERGENCY SYMPTOMS & LOCATION</span>
          </button>
        ) : (
          <button 
            type="button"
            className="emergency-pulse-btn mic-listening-btn"
            onClick={stopListeningAndParse}
          >
            <span className="listening-ping"></span>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="6" y="6" width="12" height="12" rx="2"/>
            </svg>
            <span>LISTENING NOW • TAP TO PROCESS VOICE</span>
          </button>
        )}
      </div>

      {/* Visible Emergency Input Box */}
      <div style={{ marginBottom: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <label style={{ fontWeight: '700', fontSize: '12px', color: '#1E293B', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            Spoken / Dictated Emergency Transcript:
          </label>
          <span style={{ fontSize: '11px', color: '#64748B' }}>Editable / Keyboard Dictation</span>
        </div>
        
        <textarea 
          value={manualText || transcript}
          onChange={(e) => {
            setManualText(e.target.value);
            setTranscript(e.target.value);
          }}
          rows="3"
          placeholder="E.g. Cobra bite near Chakan market 30 minutes ago, swelling on foot, victim feeling breathless..."
          className="voice-input-textarea"
        />

        <button 
          type="button"
          className="action-parse-btn"
          onClick={() => handleParseText(manualText || transcript)} 
          disabled={isParsing}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
          </svg>
          <span>{isParsing ? 'ANALYZING EMERGENCY PAYLOAD...' : 'PARSE EMERGENCY TEXT & AUTO-FILL'}</span>
        </button>
      </div>

      {apiKeyError && (
        <div className="alert-error-box">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span>{apiKeyError}</span>
        </div>
      )}

      {errorMessage && (
        <div className="alert-info-box">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 1-Click Quick Presets */}
      <div>
        <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
          1-Click Emergency Audio Presets (Instant Triage):
        </div>

        <div className="preset-btn-grid">
          <button 
            type="button"
            className="preset-btn"
            onClick={() => applyPreset("Cobra bite at Chakan market yard 30 minutes ago, severe swelling and difficulty breathing")}
          >
            <div className="preset-indicator red-indicator"></div>
            <div>
              <strong>Chakan Market Yard:</strong> Cobra bite, respiratory failure (High ASV Need)
            </div>
          </button>

          <button 
            type="button"
            className="preset-btn"
            onClick={() => applyPreset("Victim bitten on leg near Shirur highway 45 mins ago, drooping eyelids and slurred speech")}
          >
            <div className="preset-indicator amber-indicator"></div>
            <div>
              <strong>Shirur Highway:</strong> Neurotoxic ptosis & slurred speech (Ventilator Required)
            </div>
          </button>

          <button 
            type="button"
            className="preset-btn"
            onClick={() => applyPreset("Snakebite near Pimpri YCM hospital 15 mins ago, active bleeding from wound site")}
          >
            <div className="preset-indicator blue-indicator"></div>
            <div>
              <strong>Pimpri Town:</strong> Hemotoxic active bleeding & localized edema
            </div>
          </button>
        </div>
      </div>

    </div>
  );
}
