import { useState, useEffect, useRef, useCallback } from 'react';

const useSpeechSynthesis = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const cancel = useCallback(() => {
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsPaused(false);
  }, []);

  useEffect(() => {
    const handleEnd = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      utteranceRef.current = null;
    };

    const utterance = utteranceRef.current;
    if (utterance) {
      utterance.addEventListener('end', handleEnd);
    }
    
    // Cleanup on component unmount
    return () => {
      if (utterance) {
        utterance.removeEventListener('end', handleEnd);
      }
      cancel();
    };
  }, [cancel]);

  const speak = (text: string) => {
    if (!window.speechSynthesis) return;

    if (window.speechSynthesis.paused && utteranceRef.current) {
        window.speechSynthesis.resume();
        setIsPaused(false);
        setIsSpeaking(true);
    } else {
        cancel(); // Cancel any previous speech
        const utterance = new SpeechSynthesisUtterance(text);
        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
        setIsPaused(false);
    }
  };

  const pause = () => {
    if (window.speechSynthesis) {
        window.speechSynthesis.pause();
    }
    setIsPaused(true);
  };

  return { isSpeaking, isPaused, speak, pause, cancel };
};

export default useSpeechSynthesis;
