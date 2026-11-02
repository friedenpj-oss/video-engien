/**
 * Web Audio and Speech Synthesis engine for continuous video preview and export.
 */

class AudioSynthesizer {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private currentVoiceText: string = '';
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private musicGainNode: GainNode | null = null;
  private mediaStreamDest: MediaStreamAudioDestinationNode | null = null;
  private bgInterval: number | null = null;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.musicGainNode = this.ctx.createGain();
        this.musicGainNode.gain.value = 0.25;
        this.mediaStreamDest = this.ctx.createMediaStreamDestination();
        this.musicGainNode.connect(this.ctx.destination);
        this.musicGainNode.connect(this.mediaStreamDest);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public getAudioStreamTrack(): MediaStreamTrack | null {
    this.initContext();
    return this.mediaStreamDest?.stream.getAudioTracks()[0] || null;
  }

  public setMusicVolume(volume: number) {
    if (this.musicGainNode && this.ctx) {
      this.musicGainNode.gain.setValueAtTime(Math.max(0, Math.min(1, volume * 0.3)), this.ctx.currentTime);
    }
  }

  public startMusic(mood: string = 'ambient_epic') {
    this.initContext();
    if (!this.ctx || !this.musicGainNode) return;
    this.stopMusic();

    this.isPlaying = true;

    // Define harmonic frequencies based on mood
    const baseFreqs = mood === 'electronic_pulse' 
      ? [110, 138.59, 164.81, 220] // A major / synth
      : mood === 'cyberpunk'
      ? [82.41, 123.47, 146.83, 196] // E minor / dark
      : mood === 'acoustic_warm'
      ? [130.81, 164.81, 196.00, 261.63] // C major / warm
      : [65.41, 98.00, 130.81, 174.61]; // F low / cinematic drone

    let step = 0;
    const playChordStep = () => {
      if (!this.isPlaying || !this.ctx || !this.musicGainNode) return;

      const now = this.ctx.currentTime;
      const root = baseFreqs[step % baseFreqs.length];

      // Drone oscillator
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = mood === 'electronic_pulse' ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(root, now);

      // Low pass filter for warmth
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(mood === 'electronic_pulse' ? 800 : 450, now);

      // Envelope
      oscGain.gain.setValueAtTime(0, now);
      oscGain.gain.linearRampToValueAtTime(0.3, now + 1.2);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 4.5);

      osc.connect(filter);
      filter.connect(oscGain);
      oscGain.connect(this.musicGainNode);

      osc.start(now);
      osc.stop(now + 4.6);

      // Add gentle harmonic overtone
      const overtone = this.ctx.createOscillator();
      const overGain = this.ctx.createGain();
      overtone.type = 'sine';
      overtone.frequency.setValueAtTime(root * 1.5, now);
      overGain.gain.setValueAtTime(0, now);
      overGain.gain.linearRampToValueAtTime(0.12, now + 1.5);
      overGain.gain.exponentialRampToValueAtTime(0.001, now + 4.0);

      overtone.connect(overGain);
      overGain.connect(this.musicGainNode);
      overtone.start(now);
      overtone.stop(now + 4.1);

      step++;
    };

    playChordStep();
    this.bgInterval = window.setInterval(playChordStep, 4000);
  }

  public stopMusic() {
    this.isPlaying = false;
    if (this.bgInterval !== null) {
      clearInterval(this.bgInterval);
      this.bgInterval = null;
    }
  }

  public speakNarration(text: string, enabled: boolean = true) {
    if (!enabled || !text || typeof window === 'undefined' || !window.speechSynthesis) return;
    if (this.currentVoiceText === text && window.speechSynthesis.speaking) return;

    window.speechSynthesis.cancel();
    this.currentVoiceText = text;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 0.98;

    // Pick an English voice if available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    this.currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  public cancelNarration() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      this.currentVoiceText = '';
      this.currentUtterance = null;
    }
  }

  public stopAll() {
    this.stopMusic();
    this.cancelNarration();
  }
}

export const audioSynth = new AudioSynthesizer();
