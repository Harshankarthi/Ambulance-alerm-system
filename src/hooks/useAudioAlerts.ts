import { useRef, useCallback, useEffect } from 'react';

export function useAudioAlerts() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const sirenIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isPlayingRef = useRef(false);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playTone = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3) => {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
    
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  }, [getAudioContext]);

  const playSirenWail = useCallback(() => {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'sawtooth';
    
    // European-style ambulance siren (wail pattern)
    const now = ctx.currentTime;
    oscillator.frequency.setValueAtTime(600, now);
    oscillator.frequency.linearRampToValueAtTime(900, now + 0.5);
    oscillator.frequency.linearRampToValueAtTime(600, now + 1);
    
    gainNode.gain.setValueAtTime(0.15, now);
    gainNode.gain.setValueAtTime(0.15, now + 0.9);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 1);

    oscillator.start(now);
    oscillator.stop(now + 1);
  }, [getAudioContext]);

  const startSiren = useCallback(() => {
    if (isPlayingRef.current) return;
    
    isPlayingRef.current = true;
    playSirenWail();
    
    sirenIntervalRef.current = setInterval(() => {
      if (isPlayingRef.current) {
        playSirenWail();
      }
    }, 1100);
  }, [playSirenWail]);

  const stopSiren = useCallback(() => {
    isPlayingRef.current = false;
    if (sirenIntervalRef.current) {
      clearInterval(sirenIntervalRef.current);
      sirenIntervalRef.current = null;
    }
  }, []);

  const playDispatchAlert = useCallback(() => {
    const ctx = getAudioContext();
    
    // Triple beep dispatch alert
    [0, 0.2, 0.4].forEach((delay) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(880, ctx.currentTime + delay);
      
      gainNode.gain.setValueAtTime(0.2, ctx.currentTime + delay);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + 0.15);

      oscillator.start(ctx.currentTime + delay);
      oscillator.stop(ctx.currentTime + delay + 0.15);
    });
  }, [getAudioContext]);

  const playSignalClearAlert = useCallback(() => {
    const ctx = getAudioContext();
    
    // Ascending tone for signal cleared
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'sine';
    
    const now = ctx.currentTime;
    oscillator.frequency.setValueAtTime(440, now);
    oscillator.frequency.linearRampToValueAtTime(880, now + 0.2);
    
    gainNode.gain.setValueAtTime(0.25, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    oscillator.start(now);
    oscillator.stop(now + 0.3);
  }, [getAudioContext]);

  const playWarningAlert = useCallback(() => {
    // Double low beep for warning
    const ctx = getAudioContext();
    
    [0, 0.15].forEach((delay) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(440, ctx.currentTime + delay);
      
      gainNode.gain.setValueAtTime(0.2, ctx.currentTime + delay);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + 0.1);

      oscillator.start(ctx.currentTime + delay);
      oscillator.stop(ctx.currentTime + delay + 0.1);
    });
  }, [getAudioContext]);

  const playStopAlert = useCallback(() => {
    const ctx = getAudioContext();
    
    // Descending tone for stop
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'sine';
    
    const now = ctx.currentTime;
    oscillator.frequency.setValueAtTime(660, now);
    oscillator.frequency.linearRampToValueAtTime(220, now + 0.4);
    
    gainNode.gain.setValueAtTime(0.25, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

    oscillator.start(now);
    oscillator.stop(now + 0.5);
  }, [getAudioContext]);

  const playDestinationReached = useCallback(() => {
    const ctx = getAudioContext();
    
    // Success chime
    const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    
    frequencies.forEach((freq, i) => {
      const delay = i * 0.15;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, ctx.currentTime + delay);
      
      gainNode.gain.setValueAtTime(0.2, ctx.currentTime + delay);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + 0.3);

      oscillator.start(ctx.currentTime + delay);
      oscillator.stop(ctx.currentTime + delay + 0.3);
    });
  }, [getAudioContext]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSiren();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [stopSiren]);

  return {
    startSiren,
    stopSiren,
    playDispatchAlert,
    playSignalClearAlert,
    playWarningAlert,
    playStopAlert,
    playDestinationReached,
  };
}
