import React, { useEffect } from 'react';
import { Play, BookOpen, Sparkles, Info, Heart, ChevronRight, Upload } from 'lucide-react';
import { getBackgroundPath, getSpritePath } from '../../utils/assetHelper';
import { ALL_EPISODES, FIRST_EPISODE_NUM, TOTAL_EPISODES } from '../../data/episodes';
import { GAME_CONFIG } from '../../config/game.config';
import { CHARACTERS_METADATA } from '../../constants/characters';
import { GameSaveSlot } from '../../types/save';
import { soundEngine } from '../../utils/soundEngine';

interface MainMenuProps {
  onStartGame: () => void;
  onOpenEpisodeSelect: () => void;
  onOpenGallery: () => void;
  onOpenCredits: () => void;
  onOpenSaveLoad: (mode: 'save' | 'load') => void;
  onContinueLatestSave?: (save: GameSaveSlot) => void;
  currentEpisodeNum: number;
  completedEpisodes?: number[];
  latestSave?: GameSaveSlot | null;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onStartGame,
  onOpenEpisodeSelect,
  onOpenGallery,
  onOpenCredits,
  onOpenSaveLoad,
  onContinueLatestSave,
  currentEpisodeNum,
  completedEpisodes = [],
  latestSave = null,
}) => {
  const currentScript = ALL_EPISODES[currentEpisodeNum] || ALL_EPISODES[FIRST_EPISODE_NUM];
  const bgUrl = getBackgroundPath(GAME_CONFIG.menuBackground);
  const { left: leftSprite, right: rightSprite } = GAME_CONFIG.menuSprites;

  useEffect(() => {
    soundEngine.playBgm('casual');
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 flex items-center justify-center select-none font-sans">
      {/* Cenário de Fundo do Menu */}
      <img
        src={bgUrl}
        alt={GAME_CONFIG.title}
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
        }}
        className="absolute inset-0 w-full h-full object-cover scale-105 filter brightness-75 contrast-105 animate-pulse-slow"
      />

      {/* Vinheta cinematográfica e sombreamento com atmosfera temática */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/40 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(2,6,23,0.85)_100%)] pointer-events-none" />

      {/* Sprites laterais de apresentação */}
      {leftSprite && (
        <div className="absolute -bottom-6 left-2 lg:left-12 hidden md:block w-72 lg:w-96 pointer-events-none opacity-85 transition-opacity duration-500">
          <img
            src={getSpritePath(leftSprite.characterId, leftSprite.expression)}
            alt={CHARACTERS_METADATA[leftSprite.characterId].name}
            className="w-full h-auto drop-shadow-[0_20px_35px_rgba(0,0,0,0.8)] filter contrast-105"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}

      {rightSprite && (
        <div className="absolute -bottom-6 right-2 lg:right-12 hidden md:block w-72 lg:w-96 pointer-events-none opacity-85 transition-opacity duration-500">
          <img
            src={getSpritePath(rightSprite.characterId, rightSprite.expression)}
            alt={CHARACTERS_METADATA[rightSprite.characterId].name}
            className="w-full h-auto drop-shadow-[0_20px_35px_rgba(0,0,0,0.8)] filter contrast-105"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Painel Central do Menu */}
      <div className="relative z-20 flex flex-col items-center justify-center max-w-xl mx-auto px-6 text-center animate-fade-in">
        {/* Selo do Jogo */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-pink-500/40 shadow-lg text-xs font-bold text-pink-300 uppercase tracking-widest mb-4 backdrop-blur-md">
          <Heart className="w-3.5 h-3.5 fill-pink-500 text-pink-500 animate-pulse" />
          <span>{GAME_CONFIG.badge}</span>
        </div>

        {/* Logotipo do Jogo */}
        <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-300 to-sky-300 drop-shadow-[0_4px_20px_rgba(236,72,153,0.4)] mb-2">
          {GAME_CONFIG.title}
        </h1>

        <p className="text-sm sm:text-base font-medium text-slate-300 max-w-md mx-auto mb-8 leading-relaxed drop-shadow">
          {GAME_CONFIG.tagline}
        </p>

        {/* Botões do Menu */}
        <div className="w-full max-w-sm flex flex-col gap-2.5">
          {/* Botão Continuar Sessão (se houver save recente) */}
          {latestSave ? (
            <button
              onClick={() => (onContinueLatestSave ? onContinueLatestSave(latestSave) : onStartGame())}
              className="group relative w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-600 to-pink-500 hover:from-pink-500 hover:to-rose-400 text-white shadow-[0_10px_30px_rgba(236,72,153,0.35)] transition-all duration-200 transform hover:-translate-y-0.5 flex items-center gap-3 border border-pink-400/30 text-left"
            >
              <Play className="w-5 h-5 fill-current flex-shrink-0 text-white" />
              <div className="flex-1 min-w-0">
                <div className="font-extrabold text-base sm:text-lg leading-tight flex items-center gap-2">
                  <span>Continuar Jogo</span>
                  <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-pink-900/80 text-pink-200 border border-pink-400/40">
                    Ep. {latestSave.episodeNum}
                  </span>
                </div>
                <div className="text-[11px] text-pink-100 font-medium truncate mt-0.5 opacity-90">
                  {latestSave.speakerDisplayName || latestSave.speaker}: "{latestSave.previewText}"
                </div>
              </div>
              <ChevronRight className="w-5 h-5 ml-1 flex-shrink-0 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </button>
          ) : (
            <button
              onClick={onStartGame}
              className="group relative w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-extrabold text-base sm:text-lg shadow-[0_10px_30px_rgba(236,72,153,0.35)] transition-all duration-200 transform hover:-translate-y-0.5 flex items-center justify-center gap-3 border border-pink-400/30"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Iniciar Jogo (Ep. {FIRST_EPISODE_NUM})</span>
              <ChevronRight className="w-5 h-5 ml-auto opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </button>
          )}

          {/* Botão Carregar Jogo (Slots) */}
          <button
            onClick={() => onOpenSaveLoad('load')}
            className="group w-full py-3 px-5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white font-bold text-xs sm:text-sm border border-slate-700/80 hover:border-sky-500/50 shadow-md transition-all flex items-center justify-center gap-2.5 backdrop-blur-md"
          >
            <Upload className="w-4 h-4 text-sky-400" />
            <span>Carregar Jogo (Slots & Auto-Save)</span>
          </button>

          {/* Botão Selecionar Episódio */}
          <button
            onClick={onOpenEpisodeSelect}
            className="group w-full py-3 px-5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white font-bold text-xs sm:text-sm border border-slate-700/80 hover:border-slate-500 shadow-md transition-all flex items-center justify-center gap-2.5 backdrop-blur-md"
          >
            <BookOpen className="w-4 h-4 text-pink-400" />
            <span>Selecionar Episódio</span>
            <span className="text-[11px] text-slate-400 font-semibold px-2 py-0.5 rounded-full bg-slate-800 ml-auto border border-slate-700">
              Ep. {currentEpisodeNum}
            </span>
          </button>

          {/* Botão Estúdio de Sprites */}
          <button
            onClick={onOpenGallery}
            className="group w-full py-2.5 px-5 rounded-2xl bg-slate-900/70 hover:bg-slate-800/80 text-slate-300 hover:text-white font-semibold text-xs border border-slate-700/60 hover:border-pink-500/40 shadow-sm transition-all flex items-center justify-center gap-2 backdrop-blur-md"
          >
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            <span>Estúdio de Sprites & Auditoria</span>
          </button>

          {/* Botão Créditos */}
          <button
            onClick={onOpenCredits}
            className="w-full py-2.5 px-6 text-slate-400 hover:text-slate-200 font-medium text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <Info className="w-3.5 h-3.5" />
            <span>Créditos & Sobre o Jogo</span>
          </button>
        </div>

        {/* Rodapé / Subtítulo do Episódio Atual e Progresso da Campanha */}
        <div className="mt-8 flex flex-col items-center gap-2 text-xs text-slate-400">
          {completedEpisodes.length > 0 && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-[11px]">
              <span>Progresso da Campanha: {completedEpisodes.length}/{TOTAL_EPISODES} Concluídos</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-pink-500" />
            <span>Episódio Ativo: <strong>{currentScript.title}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};

