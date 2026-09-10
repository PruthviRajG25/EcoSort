/**
 * EcoSort Web Audio Utility
 * Generates subtle, pleasant synthesizer sound effects without external audio files.
 * Strictly opt-in: default is OFF, controlled by user preference.
 */

class SoundController {
  constructor() {
    this.ctx = null;
  }

  getAudioContext() {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  isSoundEnabled() {
    if (typeof window === "undefined") return false;
    try {
      return localStorage.getItem("ecosort_sound_enabled") === "true";
    } catch {
      return false;
    }
  }

  setSoundEnabled(enabled) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("ecosort_sound_enabled", enabled ? "true" : "false");
    } catch {
      // ignore storage errors
    }
  }

  /**
   * Soft chime / bell for joining a challenge or completing a positive action
   */
  playJoinChime() {
    if (!this.isSoundEnabled()) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.46);
    } catch (e) {
      console.warn("Audio playback not permitted yet:", e);
    }
  }

  /**
   * Subtle soft click for buttons, tabs, or filter switches
   */
  playClick() {
    if (!this.isSoundEnabled()) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.04);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch (e) {
      console.warn("Audio playback error:", e);
    }
  }

  /**
   * Warm harmonic chord for milestones, review submissions, or achievements
   */
  playRewardChord() {
    if (!this.isSoundEnabled()) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 major triad

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);

        gain.gain.setValueAtTime(0.04, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0005, now + 0.5 + idx * 0.05);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.05);
        osc.stop(now + 0.55 + idx * 0.05);
      });
    } catch (e) {
      console.warn("Audio playback error:", e);
    }
  }
}

export const soundManager = new SoundController();
