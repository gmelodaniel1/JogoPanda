import { BgmTrack, SfxType } from '../types/dialogue';
import { saveManager } from './saveManager';

/**
 * Motor de Som e Paisagem Sonora Procedural
 * Suporta efeitos sonoros táteis (impacto, alerta, passos, porta, cliques, afinidade)
 * e sintetizador procedural de música de fundo (BGM) via Web Audio API nativo.
 */

interface ToneOptions {
  type: OscillatorType;
  startFreq: number;
  endFreq?: number;
  volume: number;
  duration: number;
  delay?: number;
}

type WindowWithWebkitAudio = Window & {
  webkitAudioContext?: typeof AudioContext;
};

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  // BGM State
  private currentBgm: BgmTrack = 'off';
  private targetBgm: BgmTrack = 'off';
  private bgmTimer: number | null = null;
  private bgmStep: number = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        this.isMuted = saveManager.loadPreferences().isSoundMuted;
      } catch {
        this.isMuted = false;
      }
    }
  }

  private getContext(): AudioContext | null {
    if (this.isMuted || typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as WindowWithWebkitAudio).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    return this.ctx;
  }

  private playTone({ type, startFreq, endFreq, volume, duration, delay = 0 }: ToneOptions) {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const startTime = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(startFreq, startTime);
      if (endFreq !== undefined) {
        osc.frequency.exponentialRampToValueAtTime(endFreq, startTime + duration);
      }

      gain.gain.setValueAtTime(volume, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0005, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    } catch {
      // Ignora erro se o navegador ainda não liberou autoplay de áudio
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    saveManager.savePreferences({ isSoundMuted: muted });

    if (muted) {
      this.stopBgmLoop();
    } else {
      if (this.targetBgm && this.targetBgm !== 'off') {
        this.startBgmTrack(this.targetBgm);
      }
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  // =========================================================================
  // SFX: Efeitos Sonoros Contextuais
  // =========================================================================

  public playClick() {
    this.playTone({
      type: 'triangle',
      startFreq: 440,
      endFreq: 880,
      volume: 0.08,
      duration: 0.05,
    });
  }

  public playTypeBlip() {
    this.playTone({
      type: 'sine',
      startFreq: 600 + Math.random() * 80,
      volume: 0.015,
      duration: 0.03,
    });
  }

  public playLomUp() {
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      this.playTone({
        type: 'sine',
        startFreq: freq,
        volume: 0.09,
        duration: 0.25,
        delay: idx * 0.08,
      });
    });
  }

  public playLomDown() {
    const notes = [440, 392, 349.23, 293.66]; // A4, G4, F4, D4
    notes.forEach((freq, idx) => {
      this.playTone({
        type: 'sawtooth',
        startFreq: freq,
        volume: 0.06,
        duration: 0.3,
        delay: idx * 0.09,
      });
    });
  }

  /**
   * Impacto / pulso grave (choque, batida, susto)
   */
  public playImpact() {
    [0, 0.08, 0.16].forEach((offset) => {
      this.playTone({
        type: 'square',
        startFreq: 160,
        endFreq: 35,
        volume: 0.12,
        duration: 0.04,
        delay: offset,
      });
      this.playTone({
        type: 'sine',
        startFreq: 90,
        endFreq: 30,
        volume: 0.08,
        duration: 0.06,
        delay: offset + 0.01,
      });
    });
  }

  /**
   * Bipe agudo duplo (alarme, notificação, aparelho apitando)
   */
  public playAlert() {
    [0, 0.13].forEach((offset) => {
      this.playTone({
        type: 'sine',
        startFreq: 1760, // A6
        volume: 0.07,
        duration: 0.06,
        delay: offset,
      });
    });
  }

  /**
   * Passos no corredor
   */
  public playFootsteps() {
    [0, 0.2, 0.4].forEach((offset, idx) => {
      this.playTone({
        type: 'triangle',
        startFreq: 140 + idx * 10,
        endFreq: 45,
        volume: 0.045,
        duration: 0.07,
        delay: offset,
      });
    });
  }

  /**
   * Abertura/fechamento de porta ou chave na tranca
   */
  public playDoorOpen() {
    this.playTone({
      type: 'triangle',
      startFreq: 320,
      endFreq: 190,
      volume: 0.06,
      duration: 0.12,
    });
    this.playTone({
      type: 'sine',
      startFreq: 150,
      endFreq: 80,
      volume: 0.05,
      duration: 0.2,
      delay: 0.04,
    });
  }

  public playVictoryFanfare() {
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51]; // C5, E5, G5, C6, E6
    notes.forEach((freq, idx) => {
      this.playTone({
        type: 'sine',
        startFreq: freq,
        volume: 0.1,
        duration: 0.35,
        delay: idx * 0.09,
      });
    });
  }

  public playSfx(sfx: SfxType) {
    switch (sfx) {
      case 'impact':
        this.playImpact();
        break;
      case 'alert':
        this.playAlert();
        break;
      case 'footsteps':
        this.playFootsteps();
        break;
      case 'door':
        this.playDoorOpen();
        break;
      case 'lom-up':
        this.playLomUp();
        break;
      case 'lom-down':
        this.playLomDown();
        break;
      case 'click':
        this.playClick();
        break;
      case 'type':
        this.playTypeBlip();
        break;
    }
  }

  // =========================================================================
  // BGM: Sintetizador Procedural de Música Ambiente de Fundo
  // =========================================================================

  public playBgm(track: BgmTrack) {
    if (this.currentBgm === track) return;
    this.targetBgm = track;

    if (this.isMuted || track === 'off') {
      this.stopBgmLoop();
      this.currentBgm = 'off';
      return;
    }

    this.startBgmTrack(track);
  }

  public stopBgm() {
    this.playBgm('off');
  }

  public getCurrentBgm(): BgmTrack {
    return this.currentBgm;
  }

  private stopBgmLoop() {
    if (this.bgmTimer !== null) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
    this.currentBgm = 'off';
  }

  private startBgmTrack(track: BgmTrack) {
    this.stopBgmLoop();
    this.currentBgm = track;
    this.bgmStep = 0;

    // Dispara o primeiro ciclo imediatamente
    this.tickBgmCycle(track);

    // Intervalo de ciclo para cada clima sonoro
    const intervalMs = track === 'energetic' ? 1600 : track === 'tension' ? 2600 : 2200;

    this.bgmTimer = window.setInterval(() => {
      if (this.isMuted || this.currentBgm === 'off') {
        this.stopBgmLoop();
        return;
      }
      this.tickBgmCycle(track);
    }, intervalMs);
  }

  private tickBgmCycle(track: BgmTrack) {
    if (this.isMuted) return;

    if (track === 'casual') {
      // Clima aconchegante / cotidiano (Progressão Cmaj9 -> Am9 -> Fmaj7 -> G6)
      const chordProgressions = [
        [261.63, 329.63, 392.0, 493.88], // C4, E4, G4, B4
        [220.0, 261.63, 329.63, 392.0],  // A3, C4, E4, G4
        [174.61, 220.0, 261.63, 329.63], // F3, A3, C4, E4
        [196.0, 246.94, 293.66, 349.23], // G3, B3, D4, F4
      ];

      const chord = chordProgressions[this.bgmStep % chordProgressions.length];
      chord.forEach((freq, idx) => {
        this.playTone({
          type: 'sine',
          startFreq: freq,
          volume: 0.02,
          duration: 1.8,
          delay: idx * 0.12,
        });
      });
      this.bgmStep++;
    } else if (track === 'tension') {
      // Tensão / suspense (D2 sub-bass drone + acordes menores lentos)
      const root = this.bgmStep % 2 === 0 ? 73.42 : 58.27; // D2 ou Bb1
      const highTones = this.bgmStep % 2 === 0 ? [349.23, 440.0] : [329.63, 415.3]; // F4/A4 ou E4/Ab4

      // Sub-pulso
      this.playTone({
        type: 'triangle',
        startFreq: root,
        endFreq: root * 0.98,
        volume: 0.035,
        duration: 2.2,
      });

      // Notas agudas sutis
      highTones.forEach((freq, idx) => {
        this.playTone({
          type: 'sine',
          startFreq: freq,
          volume: 0.015,
          duration: 1.9,
          delay: 0.2 + idx * 0.25,
        });
      });
      this.bgmStep++;
    } else if (track === 'energetic') {
      // Clima animado / agitado (arpejo rápido)
      const sequence = [
        [440.0, 523.25], // A4, C5
        [587.33, 659.25], // D5, E5
        [783.99, 659.25], // G5, E5
        [523.25, 440.0],  // C5, A4
      ];

      const notes = sequence[this.bgmStep % sequence.length];
      notes.forEach((freq, idx) => {
        this.playTone({
          type: 'sine',
          startFreq: freq,
          endFreq: freq * 0.96,
          volume: 0.025,
          duration: 0.2,
          delay: idx * 0.25,
        });
      });

      // Pulso rítmico de fundo
      this.playTone({
        type: 'triangle',
        startFreq: 110.0,
        volume: 0.02,
        duration: 0.3,
      });

      this.bgmStep++;
    } else if (track === 'romance') {
      // Clima caloroso e carinhoso (E major / C# minor)
      const romanticNotes = [
        [329.63, 415.3, 493.88, 659.25], // E4, G#4, B4, E5
        [277.18, 329.63, 415.3, 554.37], // C#4, E4, G#4, C#5
      ];
      const chord = romanticNotes[this.bgmStep % romanticNotes.length];
      chord.forEach((freq, idx) => {
        this.playTone({
          type: 'sine',
          startFreq: freq,
          volume: 0.022,
          duration: 2.0,
          delay: idx * 0.15,
        });
      });
      this.bgmStep++;
    }
  }
}

export const soundEngine = new SoundEngine();
