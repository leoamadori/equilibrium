type StatusListener = (playing: boolean) => void;

class AudioCoachService {
  private audio: HTMLAudioElement | null = null;
  private listeners = new Set<StatusListener>();
  private playing = false;

  private ensureElement(): HTMLAudioElement {
    if (!this.audio) {
      const el = new Audio();
      el.preload = 'auto';
      el.addEventListener('play', () => this.setPlaying(true));
      el.addEventListener('pause', () => this.setPlaying(false));
      el.addEventListener('ended', () => this.setPlaying(false));
      el.addEventListener('error', () => this.setPlaying(false));
      this.audio = el;
    }
    return this.audio;
  }

  private setPlaying(next: boolean): void {
    if (this.playing !== next) {
      this.playing = next;
      for (const listener of this.listeners) {
        listener(next);
      }
    }
  }

  subscribe(listener: StatusListener): () => void {
    this.listeners.add(listener);
    listener(this.playing);
    return () => {
      this.listeners.delete(listener);
    };
  }

  isPlaying(): boolean {
    return this.playing;
  }

  /**
   * Call synchronously inside a user gesture handler (e.g. "Inizia Sessione")
   * to unlock audio playback on iOS Safari and Android WebView.
   */
  unlock(): void {
    const el = this.ensureElement();
    try {
      el.load();
    } catch {
      // Ignore
    }
  }

  playTrack(src: string): void {
    const el = this.ensureElement();
    try {
      el.pause();
      if (el.getAttribute('src') !== src) {
        el.setAttribute('src', src);
      }
      el.currentTime = 0;
      const promise = el.play();
      if (promise) {
        promise.catch(() => {
          // Autoplay blocked (NotAllowedError) or interrupted: degrade silently
          this.setPlaying(false);
        });
      }
    } catch {
      this.setPlaying(false);
    }
  }

  pause(): void {
    if (!this.audio) return;
    try {
      this.audio.pause();
    } catch {
      // Ignore
    }
  }

  resume(): void {
    if (!this.audio || !this.audio.getAttribute('src')) return;
    try {
      const promise = this.audio.play();
      if (promise) {
        promise.catch(() => {
          this.setPlaying(false);
        });
      }
    } catch {
      this.setPlaying(false);
    }
  }

  stop(): void {
    if (!this.audio) return;
    try {
      this.audio.pause();
      this.audio.currentTime = 0;
    } catch {
      // Ignore
    }
    this.setPlaying(false);
  }
}

export const audioCoach = new AudioCoachService();
