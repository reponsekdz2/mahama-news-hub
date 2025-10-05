import { useState, useEffect, useRef } from 'react';

const useSpeechSynthesis = (text: string) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    useEffect(() => {
        const synth = window.speechSynthesis;
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'en-US';

        u.onend = () => {
            setIsPlaying(false);
            setIsPaused(false);
        };
        
        utteranceRef.current = u;

        // Cleanup: cancel speech when the component unmounts or text changes
        return () => {
            synth.cancel();
        };
    }, [text]);

    const play = () => {
        const synth = window.speechSynthesis;
        if (!utteranceRef.current) return;

        if (isPaused) {
            synth.resume();
        } else {
            synth.cancel(); // Cancel any previous speech
            synth.speak(utteranceRef.current);
        }
        setIsPlaying(true);
        setIsPaused(false);
    };

    const pause = () => {
        const synth = window.speechSynthesis;
        synth.pause();
        setIsPlaying(false);
        setIsPaused(true);
    };

    const stop = () => {
        const synth = window.speechSynthesis;
        synth.cancel();
        setIsPlaying(false);
        setIsPaused(false);
    };

    return { play, pause, stop, isPlaying, isPaused };
};

export default useSpeechSynthesis;