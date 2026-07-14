import { useEffect, useRef, useCallback } from 'react';

// Reusable audio context singleton to prevent creating multiple contexts
let audioCtx: AudioContext | null = null;

const getAudioContext = () => {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
};

export const useSoundEffects = () => {
  const isEnabled = useRef(false);

  // Users must interact with the document first before AudioContext is allowed to play
  useEffect(() => {
    const enableAudio = () => {
      const ctx = getAudioContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume();
      }
      isEnabled.current = true;
      window.removeEventListener('click', enableAudio);
      window.removeEventListener('keydown', enableAudio);
    };

    window.addEventListener('click', enableAudio);
    window.addEventListener('keydown', enableAudio);

    return () => {
      window.removeEventListener('click', enableAudio);
      window.removeEventListener('keydown', enableAudio);
    };
  }, []);

  // Synthesize a very subtle, high-end "tick" sound for hovering
  const playHoverSound = useCallback(() => {
    if (!isEnabled.current) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.05);

    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.01); // Very quiet
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.05);
  }, []);

  // Synthesize a deep, premium "click" or "thud" for button clicks
  const playClickSound = useCallback(() => {
    if (!isEnabled.current) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    // A rich, low-frequency punch
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  }, []);

  return { playHoverSound, playClickSound };
};
