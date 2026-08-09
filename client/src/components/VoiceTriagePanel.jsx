import React from 'react';
import { useVoiceTriage } from '../hooks/useVoiceTriage';

export default function VoiceTriagePanel({ onApplyParsedData, onParseVoiceTranscript }) {
  const handleParseText = async (text) => {
    try {
      const parsedResult = await onParseVoiceTranscript(text);
      if (parsedResult && parsedResult.data) {
        onApplyParsedData(parsedResult.data);
      }
    } catch (err) {
      console.error('Voice parsing error:', err);
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
    <div className="win-panel">
      <div className="win-panel-title">
        🎤 CONVERSATIONAL VOICE TRIAGE MODULE (GEMINI 1.5 LLM)
      </div>
      <div className="win-panel-body">
        <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
          {!isListening ? (
            <button className="primary" onClick={startListening} style={{ flex: 1 }}>
              ▶ START VOICE TRIAGE [MIC]
            </button>
          ) : (
            <button className="danger" onClick={stopListeningAndParse} style={{ flex: 1 }}>
              ⏹ STOP & PARSE WITH GEMINI
            </button>
          )}
          <button 
            onClick={() => handleParseText(transcript)} 
            disabled={!transcript.trim()}
            style={{ width: '110px' }}
          >
            PARSE TEXT
          </button>
        </div>

        <div className="voice-box">
          <div style={{ color: '#808080', fontSize: '10px', marginBottom: '2px' }}>
            STATUS: [{status}] {isListening ? '<<< LISTENING AUDIO... >>>' : ''}
          </div>
          <div>{transcript || 'Speak or select emergency audio preset below...'}</div>
        </div>

        {errorMessage && (
          <div style={{ color: '#800000', fontWeight: 'bold', fontSize: '10px', marginBottom: '4px' }}>
            {errorMessage}
          </div>
        )}

        <div style={{ fontSize: '10px', fontWeight: 'bold', marginTop: '2px', marginBottom: '2px' }}>
          DEMO EMERGENCY VOICE PRESETS:
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <button 
            style={{ textAlign: 'left', padding: '2px 4px', fontSize: '10px' }}
            onClick={() => applyPreset("Cobra bite at Chakan market yard 30 minutes ago, swelling and severe breathing difficulty")}
          >
            🔊 Preset 1: Chakan Market - Cobra bite, respiratory failure (Severe)
          </button>
          <button 
            style={{ textAlign: 'left', padding: '2px 4px', fontSize: '10px' }}
            onClick={() => applyPreset("Victim bitten on leg near Shirur highway 45 mins ago, drooping eyelids and slurred speech")}
          >
            🔊 Preset 2: Shirur Highway - Neurotoxic ptosis & slurred speech
          </button>
          <button 
            style={{ textAlign: 'left', padding: '2px 4px', fontSize: '10px' }}
            onClick={() => applyPreset("Snakebite near Pimpri YCM hospital 15 mins ago, active bleeding from wound site")}
          >
            🔊 Preset 3: Pimpri - Hemotoxic active bleeding
          </button>
        </div>
      </div>
    </div>
  );
}
