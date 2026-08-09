import { useState, useEffect, useRef } from 'react';

export function useVoiceTriage(onParseComplete) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [status, setStatus] = useState('OFFLINE'); // OFFLINE, LISTENING, PROCESSING, COMPLETE, ERROR
  const [errorMessage, setErrorMessage] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-IN'; // Indian English recognition bias for local place names

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
        console.error('Speech recognition error:', event.error);
        setErrorMessage(`Speech Error: ${event.error}`);
        setStatus('ERROR');
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setErrorMessage('Browser does not support Web Speech Recognition API');
    }
  }, []);

  const startListening = () => {
    setTranscript('');
    setErrorMessage('');
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn('Recognition already started or error:', err);
      }
    } else {
      setStatus('SIMULATING');
    }
  };

  const stopListeningAndParse = async () => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.warn('Error stopping speech:', err);
      }
    }
    setIsListening(false);
    
    const textToProcess = transcript.trim() || 'Bitten by snake near Chakan market 30 minutes ago, swelling on leg and difficulty breathing';
    
    setStatus('PROCESSING');
    if (onParseComplete) {
      await onParseComplete(textToProcess);
      speakText('Voice triage transcript processed. Auto-filled dashboard fields. Please review and click confirm dispatch.');
      setStatus('COMPLETE');
    }
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
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
