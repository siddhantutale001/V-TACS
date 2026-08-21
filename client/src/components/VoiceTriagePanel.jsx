import React, { useState } from 'react';
import { useVoiceTriage } from '../hooks/useVoiceTriage';

export default function VoiceTriagePanel({ onApplyParsedData, onParseVoiceTranscript }) {
  const [isParsing, setIsParsing] = useState(false);
  const [manualText, setManualText] = useState('');

    const [apiKeyError, setApiKeyError] = useState(null);

    const handleParseText = async (textToParse) => {
      const targetText = textToParse || manualText || transcript;
      if (!targetText || !targetText.trim()) {
        alert('Please enter or speak emergency symptoms first.');
        return;
      }
      setIsParsing(true);
      setApiKeyError(null);
      try {
        const parsedResult = await onParseVoiceTranscript(targetText);
        if (parsedResult && parsedResult.error === 'GEMINI_API_KEY_MISSING') {
          setApiKeyError(parsedResult.message || 'Gemini API key is missing in server .env file.');
        } else if (parsedResult && parsedResult.data) {
          onApplyParsedData(parsedResult.data);
        } else if (parsedResult && !parsedResult.success) {
          setApiKeyError(parsedResult.message || 'Failed to parse voice transcript.');
        }
      } catch (err) {
        console.error('Voice parsing error:', err);
        setApiKeyError('Server error while processing voice transcript.');
      } finally {
        setIsParsing(false);
      }
    };

  const {
    isListening,
    transcript,
    setTranscript,
    status,
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
    <div style={{ background: '#FFFFFF', border: '2px solid #E2E8F0', borderRadius: '12px', padding: '16px' }}>
      
      {/* Panel Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#0F172A' }}>
          🎤 Conversational Voice Triage
        </div>
        <span className="badge-pill pill-ai">AI TRIAGE ENGINE</span>
      </div>

      {/* Mic Button Row */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
        {!isListening ? (
          <button 
            type="button"
            className="modern-btn"
            onClick={startListening} 
            style={{ flex: 1, background: '#EF4444', color: '#FFF', padding: '10px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', borderRadius: '8px' }}
          >
            ▶ START MIC LISTENING
          </button>
        ) : (
          <button 
            type="button"
            className="modern-btn"
            onClick={stopListeningAndParse} 
            style={{ flex: 1, background: '#DC2626', color: '#FFF', padding: '10px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', borderRadius: '8px' }}
          >
            ⏹ STOP & PARSE VOICE
          </button>
        )}
      </div>

      {/* Clear Visible Voice Input Text Box */}
      <div style={{ marginBottom: '14px' }}>
        <label style={{ display: 'block', fontWeight: 'bold', fontSize: '12px', color: '#334155', marginBottom: '6px' }}>
          💬 Emergency Voice Text Box (Type or Dictate Here):
        </label>
        
        <textarea 
          value={manualText || transcript}
          onChange={(e) => {
            setManualText(e.target.value);
            setTranscript(e.target.value);
          }}
          rows="3"
          placeholder="Type or dictate emergency voice symptoms here (e.g. Cobra bite near Chakan market, swelling on leg and difficulty breathing)..."
          style={{ 
            width: '100%', 
            padding: '10px', 
            borderRadius: '8px', 
            border: '2px solid #3B82F6', 
            fontSize: '13px', 
            fontFamily: 'sans-serif',
            backgroundColor: '#F0F9FF',
            color: '#1E293B',
            outline: 'none',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}
        />

        <button 
          type="button"
          className="modern-btn"
          onClick={() => handleParseText(manualText || transcript)} 
          disabled={isParsing}
          style={{ 
            width: '100%', 
            marginTop: '8px', 
            background: '#16A34A', 
            color: '#FFFFFF', 
            padding: '10px', 
            fontSize: '12px', 
            fontWeight: 'bold', 
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          {isParsing ? '⚡ Analyzing Emergency Payload...' : '⚡ PARSE EMERGENCY TEXT'}
        </button>
      </div>

      {apiKeyError && (
        <div style={{ backgroundColor: '#FEF2F2', color: '#991B1B', border: '2px solid #FCA5A5', padding: '10px 12px', fontSize: '12px', fontWeight: 'bold', borderRadius: '8px', marginBottom: '14px', lineHeight: '1.4' }}>
          ❌ <strong>AI Parsing Service Notice:</strong> {apiKeyError}
        </div>
      )}

      {errorMessage && (
        <div style={{ backgroundColor: '#FEF2F2', color: '#991B1B', border: '1px solid #FCA5A5', padding: '6px 10px', fontSize: '11px', borderRadius: '6px', marginBottom: '12px' }}>
          ℹ️ {errorMessage}
        </div>
      )}

      {/* 1-Click Audio Presets */}
      <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#475569', marginBottom: '6px' }}>
        🔊 1-Click Emergency Voice Presets:
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <button 
          type="button"
          style={{ textAlign: 'left', padding: '8px 10px', fontSize: '11px', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '6px', cursor: 'pointer' }}
          onClick={() => applyPreset("Cobra bite at Chakan market yard 30 minutes ago, severe swelling and difficulty breathing")}
        >
          🔊 <strong>Preset 1: Chakan Market</strong> - Cobra bite, respiratory failure (Severe)
        </button>

        <button 
          type="button"
          style={{ textAlign: 'left', padding: '8px 10px', fontSize: '11px', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '6px', cursor: 'pointer' }}
          onClick={() => applyPreset("Victim bitten on leg near Shirur highway 45 mins ago, drooping eyelids and slurred speech")}
        >
          🔊 <strong>Preset 2: Shirur Highway</strong> - Neurotoxic ptosis & slurred speech
        </button>

        <button 
          type="button"
          style={{ textAlign: 'left', padding: '8px 10px', fontSize: '11px', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '6px', cursor: 'pointer' }}
          onClick={() => applyPreset("Snakebite near Pimpri YCM hospital 15 mins ago, active bleeding from wound site")}
        >
          🔊 <strong>Preset 3: Pimpri</strong> - Hemotoxic active bleeding
        </button>
      </div>

    </div>
  );
}
