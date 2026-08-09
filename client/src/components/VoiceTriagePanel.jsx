import React, { useState } from 'react';
import { useVoiceTriage } from '../hooks/useVoiceTriage';

export default function VoiceTriagePanel({ onApplyParsedData, onParseVoiceTranscript }) {
  const [isParsing, setIsParsing] = useState(false);

  const handleParseText = async (text) => {
    if (!text || !text.trim()) return;
    setIsParsing(true);
    try {
      const parsedResult = await onParseVoiceTranscript(text);
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
    status,
    errorMessage,
    startListening,
    stopListeningAndParse
  } = useVoiceTriage(handleParseText);

  const applyPreset = (presetText) => {
    setTranscript(presetText);
    handleParseText(presetText);
  };

  return (
    <div className="win-panel" style={{ border: '2px inset #808080', padding: '6px', background: '#F8FAFC' }}>
      <div style={{ background: '#E63946', color: '#FFFFFF', padding: '4px 8px', fontWeight: 'bold', fontSize: '11px', display: 'flex', justifyContent: 'space-between' }}>
        <span>🎤 CONVERSATIONAL VOICE TRIAGE (GEMINI 2.5 FLASH)</span>
        <span>AI PARSER</span>
      </div>

      <div style={{ padding: '4px' }}>
        <div style={{ display: 'flex', gap: '4px', margin: '6px 0' }}>
          {!isListening ? (
            <button className="primary" onClick={startListening} style={{ flex: 1, padding: '6px', fontSize: '11px' }}>
              ▶ START MIC LISTENING
            </button>
          ) : (
            <button className="danger" onClick={stopListeningAndParse} style={{ flex: 1, padding: '6px', fontSize: '11px' }}>
              ⏹ STOP & PARSE WITH GEMINI 2.5
            </button>
          )}
          <button 
            className="success"
            onClick={() => handleParseText(transcript)} 
            disabled={!transcript.trim() || isParsing}
            style={{ width: '130px', padding: '6px', fontSize: '11px' }}
          >
            {isParsing ? 'PARSING...' : '⚡ PARSE WITH AI'}
          </button>
        </div>

        {/* Real-time editable transcript box */}
        <div className="voice-box" style={{ background: '#000', color: '#00FF00', padding: '6px', fontFamily: 'monospace', fontSize: '11px', minHeight: '55px', borderRadius: '4px' }}>
          <div style={{ color: '#808080', fontSize: '9px', marginBottom: '2px' }}>
            TRANSCRIPT INPUT BOX (EDITABLE / DEVICE DICTATION):
          </div>
          <textarea 
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Click mic to speak, or type/dictate envenoming symptoms here..."
            style={{ width: '100%', background: 'transparent', color: '#00FF00', border: 'none', outline: 'none', fontFamily: 'monospace', fontSize: '11px', resize: 'none', height: '35px' }}
          />
        </div>

        {errorMessage && (
          <div style={{ backgroundColor: '#FFF5F5', color: '#C53030', border: '1px solid #FEB2B2', padding: '4px 6px', fontSize: '10px', marginTop: '4px', borderRadius: '4px', fontWeight: 'bold' }}>
            ℹ️ {errorMessage}
          </div>
        )}

        <div style={{ fontSize: '10px', fontWeight: 'bold', marginTop: '6px', marginBottom: '4px', color: '#2D3748' }}>
          🔊 DEMO EMERGENCY VOICE PRESETS (1-CLICK GEMINI 2.5 PARSE):
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <button 
            type="button"
            style={{ textAlign: 'left', padding: '4px 8px', fontSize: '10px', background: '#EDF2F7', border: '1px solid #CBD5E0', cursor: 'pointer', borderRadius: '4px' }}
            onClick={() => applyPreset("Cobra bite at Chakan market yard 30 minutes ago, severe swelling and difficulty breathing")}
          >
            🔊 Preset 1: Chakan Market - Cobra bite, respiratory failure (Severe)
          </button>

          <button 
            type="button"
            style={{ textAlign: 'left', padding: '4px 8px', fontSize: '10px', background: '#EDF2F7', border: '1px solid #CBD5E0', cursor: 'pointer', borderRadius: '4px' }}
            onClick={() => applyPreset("Victim bitten on leg near Shirur highway 45 mins ago, drooping eyelids and slurred speech")}
          >
            🔊 Preset 2: Shirur Highway - Neurotoxic ptosis & slurred speech
          </button>

          <button 
            type="button"
            style={{ textAlign: 'left', padding: '4px 8px', fontSize: '10px', background: '#EDF2F7', border: '1px solid #CBD5E0', cursor: 'pointer', borderRadius: '4px' }}
            onClick={() => applyPreset("Snakebite near Pimpri YCM hospital 15 mins ago, active bleeding from wound site")}
          >
            🔊 Preset 3: Pimpri - Hemotoxic active bleeding
          </button>
        </div>
      </div>
    </div>
  );
}
