import confetti from 'canvas-confetti';

// Audio Context Singleton for instant, zero-latency Web Audio sound effects
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Gentle, crisp sound effect on button clicks / tab switches
 */
export function playClickSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(240, now + 0.04);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  } catch (err) {
    // Graceful fallback if audio is blocked
  }
}

/**
 * Harmonious, uplifting chime on task completion (e.g. invoice created, payment verified, product added)
 */
export function playTaskSuccessSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 major chord
    const now = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      const noteTime = now + idx * 0.06;
      gain.gain.setValueAtTime(0.0001, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.12, noteTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.36);
    });
  } catch (err) {
    // Graceful fallback
  }
}

/**
 * Soft subtle notification ping
 */
export function playNotificationSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now); // A5
    osc.frequency.setValueAtTime(1174.66, now + 0.08); // D6

    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  } catch (err) {
    // Graceful fallback
  }
}

/**
 * Multi-directional celebratory confetti burst
 */
export function triggerConfetti(origin?: { x: number; y: number }) {
  try {
    // Central cannon
    confetti({
      particleCount: 50,
      spread: 70,
      origin: origin || { y: 0.65 },
      colors: ['#0984E3', '#00CEC9', '#00B894', '#FDCB6E', '#6C5CE7', '#E84393'],
      ticks: 200,
      gravity: 0.9,
      scalar: 1.1,
    });

    // Secondary side bursts
    setTimeout(() => {
      confetti({
        particleCount: 30,
        angle: 60,
        spread: 55,
        origin: { x: 0.1, y: 0.7 },
        colors: ['#0984E3', '#00CEC9', '#FDCB6E'],
      });
      confetti({
        particleCount: 30,
        angle: 120,
        spread: 55,
        origin: { x: 0.9, y: 0.7 },
        colors: ['#00B894', '#6C5CE7', '#0984E3'],
      });
    }, 120);
  } catch (err) {
    // Graceful fallback
  }
}

/**
 * Trigger subtle device vibration if supported
 */
export function triggerHaptic(type: 'light' | 'success' | 'warning' = 'light') {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      if (type === 'light') {
        navigator.vibrate(15);
      } else if (type === 'success') {
        navigator.vibrate([20, 40, 30]);
      } else if (type === 'warning') {
        navigator.vibrate([40, 30, 40]);
      }
    } catch {
      // Ignore vibration error
    }
  }
}

/**
 * All-in-one celebration for major tasks:
 * Invoice generation, payment verification, stock add, customer onboard
 */
export function celebrateTaskCompletion(message?: string) {
  triggerConfetti();
  playTaskSuccessSound();
  triggerHaptic('success');
}
