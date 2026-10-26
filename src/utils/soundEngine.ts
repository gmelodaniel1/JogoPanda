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
        this.playBgm(this.targetBgm);
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
  // BGM: Áudio Nativo / Sintetizador Procedural de Frevo & Baião de Estrada
  // =========================================================================

  private audioElement: HTMLAudioElement | null = null;
  private isAudioFilePlaying: boolean = false;

  public playBgm(track: BgmTrack) {
    if (this.currentBgm === track && (this.isAudioFilePlaying || this.bgmTimer !== null)) return;
    this.targetBgm = track;

    if (this.isMuted || track === 'off') {
      this.stopBgmLoop();
      this.currentBgm = 'off';
      return;
    }

    this.currentBgm = track;

    // 1. Tenta carregar um arquivo .mp3 correspondente da pasta public/assets/audio/bgm/
    if (typeof window !== 'undefined') {
      const candidates = this.getBgmFileCandidates(track);
      this.tryPlayAudioFiles(candidates, () => {
        // Fallback: se nenhum arquivo de áudio estiver na pasta, ativa o sintetizador procedural de estúdio
        this.startProceduralBgmTrack(track);
      });
    } else {
      this.startProceduralBgmTrack(track);
    }
  }

  private getBgmFileCandidates(track: BgmTrack): string[] {
    const list: string[] = [];
    if (track === 'casual') {
      list.push('./assets/audio/bgm/frevo_lo_fi_estrada.mp3', './assets/audio/bgm/casual.mp3');
    } else if (track === 'tension') {
      list.push('./assets/audio/bgm/tensao_investigativa.mp3', './assets/audio/bgm/tension.mp3');
    } else if (track === 'energetic') {
      list.push('./assets/audio/bgm/frevo_heroico_vitoria.mp3', './assets/audio/bgm/energetic.mp3');
    } else if (track === 'romance') {
      list.push('./assets/audio/bgm/romance.mp3');
    }
    return list;
  }

  private tryPlayAudioFiles(candidates: string[], onFallback: () => void) {
    if (candidates.length === 0) {
      onFallback();
      return;
    }

    this.stopAudioElement();

    const tryNext = (index: number) => {
      if (index >= candidates.length) {
        onFallback();
        return;
      }

      const url = candidates[index];
      const audio = new Audio(url);
      audio.loop = true;
      audio.volume = 0.35;

      const onError = () => {
        audio.removeEventListener('error', onError);
        audio.removeEventListener('canplay', onCanPlay);
        tryNext(index + 1);
      };

      const onCanPlay = () => {
        audio.removeEventListener('error', onError);
        audio.removeEventListener('canplay', onCanPlay);
        if (this.currentBgm === 'off' || this.isMuted) return;

        this.stopBgmLoop();
        this.audioElement = audio;
        this.isAudioFilePlaying = true;
        audio.play().catch(() => {
          // Bloqueio de autoplay do navegador: usa o gerador Web Audio sintetizado
          this.stopAudioElement();
          onFallback();
        });
      };

      audio.addEventListener('error', onError);
      audio.addEventListener('canplay', onCanPlay);
      audio.load();
    };

    tryNext(0);
  }

  private stopAudioElement() {
    if (this.audioElement) {
      try {
        this.audioElement.pause();
        this.audioElement.src = '';
      } catch {
        // Ignora
      }
      this.audioElement = null;
    }
    this.isAudioFilePlaying = false;
  }

  public stopBgm() {
    this.playBgm('off');
  }

  public getCurrentBgm(): BgmTrack {
    return this.currentBgm;
  }

  private stopBgmLoop() {
    this.stopAudioElement();
    if (this.bgmTimer !== null) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
    this.currentBgm = 'off';
  }

  private startProceduralBgmTrack(track: BgmTrack) {
    if (this.bgmTimer !== null) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
    this.currentBgm = track;
    this.bgmStep = 0;

    // Dispara o primeiro compasso imediatamente
    this.tickBgmCycle(track);

    // Andamento rítmico do compasso (Baião de estrada em ~116 BPM: 520ms por tempo / 1040ms por compasso duplo)
    const intervalMs = track === 'energetic' ? 820 : track === 'tension' ? 2400 : 1080;

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
      // =====================================================================
      // TEMA PRINCIPAL: BAIÃO & FREVO LO-FI DE ESTRADA (PANDA NA BR-101)
      // Clima aventureiro, cômico e descontraído pernambucano (Sol Mixolídio)
      // =====================================================================
      const step = this.bgmStep % 16;

      // 1. Zabumba Sincopada (Pulso grave de forró/baião de estrada)
      // Tempo forte no 1, repique característico no contratempo
      const isZabumbaStep = step % 4 === 0 || step % 4 === 3;
      if (isZabumbaStep) {
        const bassFreq = (step < 8) ? 98.0 : 110.0; // G2 -> A2
        this.playTone({
          type: 'triangle',
          startFreq: bassFreq,
          endFreq: bassFreq * 0.92,
          volume: 0.055,
          duration: 0.22,
        });
        this.playTone({
          type: 'sine',
          startFreq: bassFreq * 0.5,
          endFreq: 38,
          volume: 0.04,
          duration: 0.18,
        });
      }

      // 2. Triângulo Metálico de Estrada (Chimbau no contratempo)
      [0.12, 0.38, 0.65].forEach((offset) => {
        this.playTone({
          type: 'triangle',
          startFreq: 2850,
          endFreq: 1950,
          volume: 0.008,
          duration: 0.03,
          delay: offset,
        });
      });

      // 3. Melodia Saltitante Nordestina (Pífano / Melódica Lo-Fi cômica em Sol Mixolídio)
      // Fraseado vivo de comédia investigativa
      const melodyPhases: Record<number, { freq: number; duration: number; delay: number }[]> = {
        0: [
          { freq: 392.0, duration: 0.22, delay: 0.0 },   // G4
          { freq: 493.88, duration: 0.18, delay: 0.26 }, // B4
        ],
        1: [
          { freq: 587.33, duration: 0.24, delay: 0.0 },  // D5
          { freq: 698.46, duration: 0.22, delay: 0.26 }, // F5 (sabor mixolídio nordestino)
        ],
        2: [
          { freq: 659.25, duration: 0.22, delay: 0.0 },  // E5
          { freq: 587.33, duration: 0.26, delay: 0.24 }, // D5
        ],
        3: [
          { freq: 493.88, duration: 0.32, delay: 0.0 },  // B4 (pausa/swing)
        ],
        4: [
          { freq: 523.25, duration: 0.20, delay: 0.0 },  // C5
          { freq: 659.25, duration: 0.20, delay: 0.24 }, // E5
        ],
        5: [
          { freq: 783.99, duration: 0.24, delay: 0.0 },  // G5
          { freq: 698.46, duration: 0.20, delay: 0.26 }, // F5
        ],
        6: [
          { freq: 587.33, duration: 0.22, delay: 0.0 },  // D5
          { freq: 493.88, duration: 0.22, delay: 0.24 }, // B4
        ],
        7: [
          { freq: 392.0, duration: 0.38, delay: 0.0 },   // G4
        ],
        8: [
          { freq: 440.0, duration: 0.20, delay: 0.0 },   // A4
          { freq: 523.25, duration: 0.20, delay: 0.24 }, // C5
        ],
        9: [
          { freq: 587.33, duration: 0.22, delay: 0.0 },  // D5
          { freq: 523.25, duration: 0.18, delay: 0.24 }, // C5
        ],
        10: [
          { freq: 493.88, duration: 0.22, delay: 0.0 },  // B4
          { freq: 440.0, duration: 0.22, delay: 0.24 },  // A4
        ],
        11: [
          { freq: 392.0, duration: 0.32, delay: 0.0 },   // G4
        ],
        12: [
          { freq: 587.33, duration: 0.20, delay: 0.0 },  // D5
          { freq: 698.46, duration: 0.24, delay: 0.22 }, // F5
        ],
        13: [
          { freq: 783.99, duration: 0.26, delay: 0.0 },  // G5
          { freq: 880.0, duration: 0.28, delay: 0.24 },  // A5
        ],
        14: [
          { freq: 783.99, duration: 0.24, delay: 0.0 },  // G5
          { freq: 659.25, duration: 0.22, delay: 0.24 }, // E5
        ],
        15: [
          { freq: 392.0, duration: 0.45, delay: 0.0 },   // G4 (final triunfante)
        ],
      };

      const notes = melodyPhases[step] || [];
      notes.forEach((n) => {
        this.playTone({
          type: 'triangle',
          startFreq: n.freq,
          endFreq: n.freq * 0.99,
          volume: 0.024,
          duration: n.duration,
          delay: n.delay,
        });
      });

      this.bgmStep++;
    } else if (track === 'tension') {
      // =====================================================================
      // TENSÃO & SUSPENSE INVESTIGATIVO NO CANAVIAL
      // Dissonâncias menores, drone sombrio em Ré e pulso cardíaco distante
      // =====================================================================
      const isEven = this.bgmStep % 2 === 0;
      const root = isEven ? 65.41 : 61.74; // C2 ou B1 (tensão cromática)
      const dissonantChord = isEven
        ? [293.66, 349.23, 415.3]  // D4, F4, G#4 (trítono investigativo)
        : [277.18, 329.63, 440.0];  // C#4, E4, A4

      // Sub-pulso cardíaco
      this.playTone({
        type: 'triangle',
        startFreq: root,
        endFreq: root * 0.94,
        volume: 0.05,
        duration: 1.8,
      });

      // Eco misterioso nas altas
      dissonantChord.forEach((freq, idx) => {
        this.playTone({
          type: 'sine',
          startFreq: freq,
          volume: 0.016,
          duration: 1.6,
          delay: 0.15 + idx * 0.28,
        });
      });

      this.bgmStep++;
    } else if (track === 'energetic') {
      // =====================================================================
      // AÇÃO / PERSEGUIÇÃO / FREVO DE COMBATE
      // Ritmo rápido de galope, staccato enérgico e metais sintetizados
      // =====================================================================
      const sequence = [
        [587.33, 783.99], // D5, G5
        [880.0, 1046.5],  // A5, C6
        [987.77, 880.0],  // B5, A5
        [783.99, 587.33], // G5, D5
      ];

      const notes = sequence[this.bgmStep % sequence.length];
      notes.forEach((freq, idx) => {
        this.playTone({
          type: 'sawtooth',
          startFreq: freq,
          endFreq: freq * 0.97,
          volume: 0.022,
          duration: 0.14,
          delay: idx * 0.18,
        });
      });

      // Baixo percussivo acelerado
      this.playTone({
        type: 'square',
        startFreq: 146.83, // D3
        endFreq: 73.42,
        volume: 0.035,
        duration: 0.16,
      });

      this.bgmStep++;
    } else if (track === 'romance') {
      // Clima nostálgico / ameno (sem exagero romântico, voltado para memórias da viagem)
      const memoriesNotes = [
        [392.0, 493.88, 587.33], // Sol Maior sereno
        [329.63, 392.0, 493.88], // Mi menor
      ];
      const chord = memoriesNotes[this.bgmStep % memoriesNotes.length];
      chord.forEach((freq, idx) => {
        this.playTone({
          type: 'sine',
          startFreq: freq,
          volume: 0.018,
          duration: 1.7,
          delay: idx * 0.2,
        });
      });
      this.bgmStep++;
    }
  }
}

export const soundEngine = new SoundEngine();
