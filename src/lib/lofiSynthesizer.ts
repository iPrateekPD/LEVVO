// Procedural Web Audio API Lo-Fi & 8-Bit Ambient Music Synthesizer
// Zero external mp3 dependencies - lightweight, instantaneous, works offline.

class LofiSynthesizer {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private timerId: number | null = null;
  private masterGain: GainNode | null = null;
  private currentTrackIndex: number = 0;
  private listeners: Set<(playing: boolean, trackName: string) => void> = new Set();

  public readonly tracks = [
    { name: "Cosmic Lo-Fi", tempo: 72, scale: [261.63, 329.63, 392.0, 493.88, 587.33] }, // Cmaj9 / Em
    { name: "8-Bit Starlight", tempo: 85, scale: [220.0, 261.63, 329.63, 392.0, 440.0] }, // Am7
    { name: "Cyberpunk Rain", tempo: 65, scale: [174.61, 220.0, 261.63, 329.63, 392.0] }, // Fmaj7
  ];

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.18, this.ctx.currentTime); // Gentle comfortable ambient volume
        this.masterGain.connect(this.ctx.destination);
      }
    }
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.play();
      return true;
    }
  }

  public play() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    this.isPlaying = true;
    this.notifyListeners();

    // Start playing repeating gentle chord progressions
    let step = 0;
    const intervalMs = (60 / this.tracks[this.currentTrackIndex].tempo) * 1000;

    const playChordStep = () => {
      if (!this.isPlaying || !this.ctx || !this.masterGain) return;

      const track = this.tracks[this.currentTrackIndex];
      const scale = track.scale;

      // Generate a lush 3-note ambient chord
      const rootIndex = (step * 2) % scale.length;
      const thirdIndex = (rootIndex + 2) % scale.length;
      const fifthIndex = (rootIndex + 4) % scale.length;

      const notes = [scale[rootIndex], scale[thirdIndex], scale[fifthIndex]];

      notes.forEach((freq, i) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        // Warm analog low-pass filtering for lo-fi character
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(480 + (i * 120), this.ctx.currentTime);

        // Warm triangle or sine wave
        osc.type = i === 0 ? "triangle" : "sine";
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        // Soft ADSR envelope
        const now = this.ctx.currentTime;
        const duration = (intervalMs / 1000) * 1.8;
        noteGain.gain.setValueAtTime(0.001, now);
        noteGain.gain.exponentialRampToValueAtTime(0.08, now + 0.3);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + duration);
      });

      step++;
      this.timerId = window.setTimeout(playChordStep, intervalMs);
    };

    playChordStep();
  }

  public stop() {
    this.isPlaying = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.notifyListeners();
  }

  public nextTrack(): string {
    this.currentTrackIndex = (this.currentTrackIndex + 1) % this.tracks.length;
    if (this.isPlaying) {
      this.stop();
      this.play();
    } else {
      this.notifyListeners();
    }
    return this.tracks[this.currentTrackIndex].name;
  }

  public setVolume(vol: number) {
    if (this.masterGain && this.ctx) {
      const safeVol = Math.max(0, Math.min(1, vol));
      this.masterGain.gain.setValueAtTime(safeVol * 0.3, this.ctx.currentTime);
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getCurrentTrackName(): string {
    return this.tracks[this.currentTrackIndex].name;
  }

  public subscribe(cb: (playing: boolean, trackName: string) => void): () => void {
    this.listeners.add(cb);
    cb(this.isPlaying, this.getCurrentTrackName());
    return () => {
      this.listeners.delete(cb);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((cb) => cb(this.isPlaying, this.getCurrentTrackName()));
  }
}

export const lofiMusic = typeof window !== "undefined" ? new LofiSynthesizer() : (null as any);
