import React, { useState } from 'react';
import { Volume2, VolumeX, Play, Pause, History, RotateCcw, Gauge, Sparkles, BookOpen, Home, Save } from 'lucide-react';
import { soundEngine } from '../../utils/soundEngine';
import { TextSpeed } from '../../types/game';
import { EPISODE_NUMBERS } from '../../data/episodes';

interface ControlToolbarProps {
  autoPlay: boolean;
  textSpeed: TextSpeed;
  onToggleAutoPlay: () => void;
  onToggleBacklog: () => void;
  onReset: () => void;
  onSetTextSpeed: (speed: TextSpeed) => void;
  onToggleGallery?: () => void;
  onOpenSaveLoad?: (mode: 'save' | 'load') => void;
  currentEpisodeNum?: number;
  onSelectEpisode?: (epNum: number) => void;
  onReturnToMenu?: () => void;
}

const SPEED_LABELS: Record<TextSpeed, string> = {
  25: '1x',
  12: '2x',
  3: '3x',
};

const NEXT_SPEED: Record<TextSpeed, TextSpeed> = {
  25: 12,
  12: 3,
  3: 25,
};

export const ControlToolbar: React.FC<ControlToolbarProps> = ({
  autoPlay,
  textSpeed,
  onToggleAutoPlay,
  onToggleBacklog,
  onReset,
  onSetTextSpeed,
  onToggleGallery,
  onOpenSaveLoad,
  currentEpisodeNum,
  onSelectEpisode,
  onReturnToMenu,
}) => {
  const [isMuted, setIsMuted] = useState(soundEngine.getIsMuted());

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    soundEngine.setMuted(nextMuted);
    setIsMuted(nextMuted);
    if (!nextMuted) soundEngine.playClick();
  };

  const cycleTextSpeed = () => {
    soundEngine.playClick();
    onSetTextSpeed(NEXT_SPEED[textSpeed]);
  };

  return (
    <div className="relative z-30 flex items-center gap-1.5 p-1 rounded-full bg-slate-900/85 backdrop-blur-md border border-slate-700 shadow-lg text-slate-300">
      {/* Botão Menu Principal */}
      {onReturnToMenu && (
        <button
          onClick={onReturnToMenu}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          title="Voltar ao Menu Principal"
        >
          <Home className="w-3.5 h-3.5 text-pink-400" />
          <span className="hidden sm:inline">MENU</span>
        </button>
      )}

      {/* Botão Auto Play */}
      <button
        onClick={onToggleAutoPlay}
        className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 ${
          autoPlay
            ? 'bg-pink-600 text-white shadow-[0_0_12px_rgba(236,72,153,0.5)]'
            : 'hover:bg-slate-800 text-slate-300'
        }`}
        title="Avanço Automático de Texto"
      >
        {autoPlay ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        <span>AUTO</span>
      </button>

      {/* Botão de Histórico (Backlog) */}
      <button
        onClick={onToggleBacklog}
        className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-slate-800 transition-colors"
        title="Histórico de Diálogos"
      >
        <History className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">LOG</span>
      </button>

      {/* Botão Salvar / Carregar Progresso */}
      {onOpenSaveLoad && (
        <button
          onClick={() => {
            soundEngine.playClick();
            onOpenSaveLoad('save');
          }}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-slate-800 transition-colors text-pink-300 hover:text-white"
          title="Salvar ou Carregar Progresso"
        >
          <Save className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">SAVE</span>
        </button>
      )}

      {/* Botão Estúdio de Sprites */}
      {onToggleGallery && (
        <button
          onClick={onToggleGallery}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/40 transition-all shadow-sm"
          title="Abrir Estúdio de Sprites e Auditoria"
        >
          <Sparkles className="w-3.5 h-3.5 text-pink-400" />
          <span className="hidden sm:inline">SPRITES</span>
        </button>
      )}

      {/* Seletor Rápido de Episódios */}
      {onSelectEpisode && currentEpisodeNum && (
        <div className="flex items-center gap-1 bg-slate-800/90 rounded-full px-2 py-1 border border-slate-700/60 text-xs">
          <BookOpen className="w-3.5 h-3.5 text-pink-400" />
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mr-0.5">Ep</span>
          {EPISODE_NUMBERS.map((num) => (
            <button
              key={num}
              onClick={() => onSelectEpisode(num)}
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                currentEpisodeNum === num
                  ? 'bg-pink-600 text-white shadow-sm ring-1 ring-pink-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
              title={`Jogar Episódio ${num}`}
            >
              {num}
            </button>
          ))}
        </div>
      )}

      {/* Velocidade do Texto */}
      <button
        onClick={cycleTextSpeed}
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold hover:bg-slate-800 transition-colors"
        title="Velocidade da Digitação"
      >
        <Gauge className="w-3.5 h-3.5 text-pink-400" />
        <span className="font-mono text-[11px]">{SPEED_LABELS[textSpeed]}</span>
      </button>

      {/* Mute Som */}
      <button
        onClick={handleToggleMute}
        className="p-1.5 rounded-full hover:bg-slate-800 transition-colors text-slate-400 hover:text-white"
        title={isMuted ? 'Ativar Efeitos Sonoros' : 'Mutar Áudio'}
      >
        {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
      </button>

      {/* Reiniciar */}
      <button
        onClick={onReset}
        className="p-1.5 rounded-full hover:bg-slate-800 transition-colors text-slate-400 hover:text-amber-400"
        title="Reiniciar Cena"
      >
        <RotateCcw className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
