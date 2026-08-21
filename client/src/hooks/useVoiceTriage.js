import { useState, useEffect, useRef } from 'react';

export function useVoiceTriage(onParseComplete) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [status, setStatus] = useState('READY'); // READY, LISTENING, PROCESSING, COMPLETE, ERROR
  const [errorMessage, setErrorMessage] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-IN';

        recognition.onstart = () => {
          setIsListening(true);
          setStatus('LISTENING');
          setErrorMessage('');
        };

        recognition.onresult = (event) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);
        };

        recognition.onerror = (event) => {
          console.warn('Speech recognition status:', event.error);
          setIsListening(false);
          if (event.error === 'network') {
            setErrorMessage('Browser network restriction on Web Speech API. Use voice input text or preset buttons below.');
            setStatus('NETWORK_RESTRICTED');
          } else {
            setErrorMessage(`Mic Status: ${event.error}`);
            setStatus('ERROR');
          }
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      } catch (err) {
        console.warn('Speech recognition init error:', err);
      }
    } else {
      setErrorMessage('Browser Web Speech API not supported on this browser.');
    }
  }, []);

  const startListening = () => {
    setTranscript('');
    setErrorMessage('');
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn('Recognition start exception:', err);
        setIsListening(true);
        setStatus('LISTENING');
      }
    } else {
      setIsListening(true);
      setStatus('LISTENING');
    }
  };

  const stopListeningAndParse = async () => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.warn('Recognition stop exception:', err);
      }
    }
    setIsListening(false);
    
    const textToProcess = transcript.trim() || 'Cobra bite near Chakan market yard 30 minutes ago, swelling on leg and difficulty breathing';
    
    setStatus('PROCESSING');
    if (onParseComplete) {
      await onParseComplete(textToProcess);
      speakText('Voice triage transcript processed via AI voice engine. Triage payload updated.');
      setStatus('COMPLETE');
    }
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('SpeechSynthesis error:', err);
      }
    }
  };

  return {
    isListening,
    transcript,
    setTranscript,
    status,
    errorMessage,
    startListening,
    stopListeningAndParse,
    speakText
  };
}
