export interface MusicTrackMeta {
  index: number;
  title: string;
  subtitle: string;
  tempoBpm: number;
  notes: number[];
  chords: number[][];
}

export const DEFAULT_SPHERE_SONG_URL = '/assets/cho-anh-chut-thoi.mp3';
export const DEFAULT_SPHERE_SONG_NAME =
  'chờ anh chút thôi. #nhachaymoingay #lofi #lyrics #chill.mp3';

export const ROMANTIC_TRACKS: MusicTrackMeta[] = [
  {
    index: 0,
    title: 'Hộp Nhạc Ánh Trăng Tình Yêu',
    subtitle: 'Nhạc mở đầu (Trước khi vào Quả Cầu)',
    tempoBpm: 88,
    // C major / A minor romantic arpeggio melody (MIDI notes)
    notes: [
      72, 76, 79, 84, 83, 79, 76, 72,
      69, 72, 76, 81, 79, 76, 72, 69,
      65, 69, 72, 77, 76, 72, 69, 65,
      67, 71, 74, 79, 77, 74, 71, 67,
    ],
    chords: [
      [60, 64, 67],
      [57, 60, 64],
      [53, 57, 60],
      [55, 59, 62],
    ],
  },
  {
    index: 1,
    title: 'Bản Giao Hưởng Ngàn Sao',
    subtitle: 'Giai Điệu Mở Đầu Dịu Dàng',
    tempoBpm: 78,
    // F major / D minor dreamy starlight progression
    notes: [
      77, 81, 84, 88, 86, 84, 81, 77,
      74, 77, 81, 86, 84, 81, 77, 74,
      70, 74, 77, 82, 81, 77, 74, 70,
      72, 76, 79, 84, 82, 79, 76, 72,
    ],
    chords: [
      [53, 57, 60],
      [50, 53, 57],
      [46, 50, 53],
      [48, 52, 55],
    ],
  },
  {
    index: 2,
    title: 'Đóa Hoa Hồng Đêm Kỷ Niệm',
    subtitle: 'Piano Mở Đầu Ngọt Ngào',
    tempoBpm: 94,
    // G major romantic waltz feel
    notes: [
      79, 83, 86, 88, 86, 83, 79, 74,
      76, 79, 83, 86, 84, 83, 79, 76,
      72, 76, 79, 84, 83, 79, 76, 72,
      74, 78, 81, 86, 84, 81, 78, 74,
    ],
    chords: [
      [55, 59, 62],
      [52, 55, 59],
      [48, 52, 55],
      [50, 54, 57],
    ],
  },
];

function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

class RomanticAudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private phase: 'intro' | 'sphere' = 'intro';
  private trackIndex = 0;
  private stepIndex = 0;
  private timerId: number | null = null;
  private fadeTimerId: number | null = null;
  private sphereAudioEl: HTMLAudioElement | null = null;
  private customAudioUrl: string | undefined;

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private getEffectiveSphereSongUrl(): string {
    return this.customAudioUrl && this.customAudioUrl.trim()
      ? this.customAudioUrl
      : DEFAULT_SPHERE_SONG_URL;
  }

  private ensureSphereAudioElement(): HTMLAudioElement | null {
    if (typeof window === 'undefined') return null;
    const targetUrl = this.getEffectiveSphereSongUrl();

    if (!this.sphereAudioEl || this.sphereAudioEl.dataset.srcUrl !== targetUrl) {
      if (this.sphereAudioEl) {
        this.sphereAudioEl.pause();
        this.sphereAudioEl = null;
      }
      const audio = new Audio(targetUrl);
      audio.dataset.srcUrl = targetUrl;
      audio.loop = true;
      audio.preload = 'auto';
      audio.volume = 0.85;
      // Double-guarantee infinite looping across all desktop & mobile browsers
      audio.addEventListener('ended', () => {
        audio.currentTime = 0;
        if (this.isPlaying && this.phase === 'sphere') {
          audio.play().catch(() => {});
        }
      });
      this.sphereAudioEl = audio;
    } else {
      this.sphereAudioEl.loop = true;
    }

    return this.sphereAudioEl;
  }

  public setCustomAudio(dataUrl?: string) {
    const normalized =
      dataUrl && dataUrl.trim() ? dataUrl.trim() : undefined;
    if (this.customAudioUrl === normalized) return;
    this.customAudioUrl = normalized;

    if (this.sphereAudioEl) {
      this.sphereAudioEl.pause();
      this.sphereAudioEl = null;
    }

    this.ensureSphereAudioElement();

    if (this.isPlaying && this.phase === 'sphere') {
      this.playSphereAudioWithFadeIn();
    }
  }

  public setTrackIndex(index: number) {
    this.trackIndex = index % ROMANTIC_TRACKS.length;
    this.stepIndex = 0;
    if (this.isPlaying && this.phase === 'intro') {
      this.restartScheduler();
    }
  }

  /**
   * Starts Phase 1 (Intro Music Box) at the beginning of the experience,
   * and preloads the Phase 2 song ("chờ anh chút thôi...") so it transitions seamlessly.
   */
  public startIntro() {
    this.ensureContext();
    this.isPlaying = true;
    this.phase = 'intro';

    const audio = this.ensureSphereAudioElement();
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      audio.load();
    }

    this.restartScheduler();
  }

  /**
   * Called right when the user clicks the flower bouquet to transition to the 3D Sphere:
   * Stops the intro music box and plays "chờ anh chút thôi. #nhachaymoingay #lofi #lyrics #chill" on loop!
   */
  public switchToSphereSong() {
    this.ensureContext();
    this.phase = 'sphere';
    this.isPlaying = true;

    // Stop Phase 1 music box scheduler
    if (this.timerId !== null) {
      window.clearInterval(this.timerId);
      this.timerId = null;
    }

    this.playSphereAudioWithFadeIn();
  }

  private playSphereAudioWithFadeIn() {
    const audio = this.ensureSphereAudioElement();
    if (!audio) return;

    audio.loop = true;
    if (this.fadeTimerId !== null) {
      window.clearInterval(this.fadeTimerId);
      this.fadeTimerId = null;
    }

    audio.volume = 0.35;
    audio.play().catch(() => {});

    let vol = 0.35;
    this.fadeTimerId = window.setInterval(() => {
      if (!this.isPlaying || this.phase !== 'sphere' || !this.sphereAudioEl) {
        if (this.fadeTimerId !== null) {
          window.clearInterval(this.fadeTimerId);
          this.fadeTimerId = null;
        }
        return;
      }
      vol = Math.min(0.88, vol + 0.06);
      this.sphereAudioEl.volume = vol;
      if (vol >= 0.88 && this.fadeTimerId !== null) {
        window.clearInterval(this.fadeTimerId);
        this.fadeTimerId = null;
      }
    }, 55);
  }

  public start() {
    this.ensureContext();
    this.isPlaying = true;

    if (this.phase === 'sphere') {
      if (this.timerId !== null) {
        window.clearInterval(this.timerId);
        this.timerId = null;
      }
      const audio = this.ensureSphereAudioElement();
      if (audio) {
        audio.loop = true;
        audio.volume = 0.88;
        audio.play().catch(() => {});
      }
      return;
    }

    this.restartScheduler();
  }

  public stop() {
    this.isPlaying = false;
    if (this.timerId !== null) {
      window.clearInterval(this.timerId);
      this.timerId = null;
    }
    if (this.fadeTimerId !== null) {
      window.clearInterval(this.fadeTimerId);
      this.fadeTimerId = null;
    }
    if (this.sphereAudioEl) {
      this.sphereAudioEl.pause();
    }
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.start();
    }
    return this.isPlaying;
  }

  public getPlayingState(): boolean {
    return this.isPlaying;
  }

  private restartScheduler() {
    if (this.timerId !== null) {
      window.clearInterval(this.timerId);
      this.timerId = null;
    }
    const track = ROMANTIC_TRACKS[this.trackIndex] || ROMANTIC_TRACKS[0];
    const stepMs = Math.round((60 / track.tempoBpm / 2) * 1000);

    this.playNextNote();
    this.timerId = window.setInterval(() => {
      if (!this.isPlaying || this.phase !== 'intro') return;
      this.playNextNote();
    }, stepMs);
  }

  private playNextNote() {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const track = ROMANTIC_TRACKS[this.trackIndex] || ROMANTIC_TRACKS[0];
    const noteMidi = track.notes[this.stepIndex % track.notes.length];
    const now = ctx.currentTime;

    // Celesta / Music Box bell tone
    this.triggerMusicBoxTone(ctx, midiToFreq(noteMidi), now, 1.45, 0.11);
    // Subtle octave shimmer
    this.triggerMusicBoxTone(ctx, midiToFreq(noteMidi + 12), now, 0.85, 0.035);

    // Warm pad chord every 8 steps
    if (this.stepIndex % 8 === 0) {
      const chordIdx = Math.floor(this.stepIndex / 8) % track.chords.length;
      const chord = track.chords[chordIdx];
      chord.forEach((cMidi) => {
        this.triggerWarmPadTone(ctx, midiToFreq(cMidi), now, 2.4, 0.045);
      });
    }

    this.stepIndex = (this.stepIndex + 1) % track.notes.length;
  }

  private triggerMusicBoxTone(
    ctx: AudioContext,
    freq: number,
    startTime: number,
    duration: number,
    peakGain: number
  ) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(peakGain, startTime + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
  }

  private triggerWarmPadTone(
    ctx: AudioContext,
    freq: number,
    startTime: number,
    duration: number,
    peakGain: number
  ) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(peakGain, startTime + 0.35);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
  }

  public playSparkleChime() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [76, 79, 83, 88];
    notes.forEach((midi, idx) => {
      this.triggerMusicBoxTone(
        ctx,
        midiToFreq(midi),
        now + idx * 0.065,
        0.9,
        0.07
      );
    });
  }
}

export const romanticAudio = new RomanticAudioEngine();
