/**
 * Web Audio API Synthesizer for 8-bit Retro Arcade Sound Effects
 * Completely client-side, zero latency, no network asset dependencies
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("life_rpg_sfx_muted");
      this.isMuted = saved === "true";
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (typeof window !== "undefined") {
      localStorage.setItem("life_rpg_sfx_muted", String(this.isMuted));
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Tactile 8-bit mechanical button click
   */
  public playClick() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "square";
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch {
      // AudioContext might be blocked until first user gesture
    }
  }

  /**
   * Ascending 3-tone chime for quest completion
   */
  public playComplete() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = ctx.currentTime + idx * 0.07;
        const duration = 0.12;

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.12, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + duration);
      });
    } catch {}
  }

  /**
   * Triumphant 8-bit Level-Up Fanfare
   */
  public playLevelUp() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const melody = [
        { freq: 440, time: 0, dur: 0.1 },
        { freq: 554.37, time: 0.1, dur: 0.1 },
        { freq: 659.25, time: 0.2, dur: 0.1 },
        { freq: 880, time: 0.3, dur: 0.35 },
      ];

      melody.forEach(({ freq, time, dur }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = ctx.currentTime + time;

        osc.type = "square";
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.15, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + dur);
      });
    } catch {}
  }

  /**
   * Heavy punch on boss hit
   */
  public playBossHit() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {}
  }

  public playBlip() {
    this.playClick();
  }

  public playVictory() {
    this.playComplete();
  }

  public playPowerUp() {
    this.playLevelUp();
  }
}

export const sounds = new SoundEngine();

export const soundEffects = {
  playBlip: () => sounds.playClick(),
  playClick: () => sounds.playClick(),
  playVictory: () => sounds.playComplete(),
  playComplete: () => sounds.playComplete(),
  playLevelUp: () => sounds.playLevelUp(),
  playPowerUp: () => sounds.playLevelUp(),
  playBossHit: () => sounds.playBossHit(),
};
