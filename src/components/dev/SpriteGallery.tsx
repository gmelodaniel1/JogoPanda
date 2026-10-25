import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Grid,
  Monitor,
  Moon,
  Sun,
  Layers,
  Play,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Sliders,
} from 'lucide-react';
import { CharacterId, CharacterPosition, SpriteAnimation } from '../../types/character';
import { CHARACTERS_METADATA, GALLERY_CHARACTER_IDS } from '../../constants/characters';
import { GAME_CONFIG } from '../../config/game.config';
import { getSpritePath } from '../../utils/assetHelper';
import { CharacterSprite } from '../vn/CharacterSprite';
import { BackgroundView } from '../vn/BackgroundView';
import { CharacterAvatarSvg } from '../placeholders/CharacterAvatarSvg';

interface SpriteGalleryProps {
  onClose: () => void;
}

type BgMode = 'navy' | 'black' | 'white' | 'checker' | 'game';
type ViewMode = 'grid' | 'stage';

export const SpriteGallery: React.FC<SpriteGalleryProps> = ({ onClose }) => {
  const [selectedCharId, setSelectedCharId] = useState<CharacterId>(GALLERY_CHARACTER_IDS[0] ?? 'protagonist');
  const [selectedExpression, setSelectedExpression] = useState<string>('neutral');
  const [bgMode, setBgMode] = useState<BgMode>('navy');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [animation, setAnimation] = useState<SpriteAnimation>('none');
  const [position, setPosition] = useState<CharacterPosition>('center');
  const [scale, setScale] = useState<number>(1);
  const [flipHorizontal, setFlipHorizontal] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [failedSprites, setFailedSprites] = useState<Record<string, boolean>>({});

  const characterKeys = GALLERY_CHARACTER_IDS;

  const filteredCharacters = characterKeys.filter((id) => {
    const meta = CHARACTERS_METADATA[id];
    const q = searchQuery.toLowerCase();
    return meta.name.toLowerCase().includes(q) || id.toLowerCase().includes(q);
  });

  const currentMeta = CHARACTERS_METADATA[selectedCharId];
  const expressions = currentMeta.knownExpressions;

  const getBgStyle = () => {
    switch (bgMode) {
      case 'black':
        return 'bg-black text-white';
      case 'white':
        return 'bg-white text-slate-900';
      case 'checker':
        return 'bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] bg-slate-950 text-white';
      case 'game':
        return 'bg-slate-950 text-white';
      case 'navy':
      default:
        return 'bg-slate-900 text-white';
    }
  };

  const triggerAnimation = (anim: SpriteAnimation) => {
    setAnimation('none');
    setTimeout(() => {
      setAnimation(anim);
    }, 30);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/95 backdrop-blur-xl text-slate-100 font-sans select-none overflow-hidden animate-fade-in">
      {/* Barra de Topo */}
      <header className="flex flex-wrap items-center justify-between gap-3 px-3 sm:px-6 py-2.5 sm:py-4 border-b border-slate-800 bg-slate-900/80">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-pink-500/20 text-pink-400 border border-pink-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100 flex items-center gap-2">
              {GAME_CONFIG.title} • Estúdio de Sprites & Validação
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium">
                {GALLERY_CHARACTER_IDS.reduce((sum, id) => sum + CHARACTERS_METADATA[id].knownExpressions.length, 0)} poses cadastradas
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Inspeção de fundo, teste de anti-aliasing e simulação de reações em tempo real
            </p>
          </div>
        </div>

        {/* Controles de Fundo e Modo */}
        <div className="flex items-center gap-3">
          {/* Seletor de Modo de Exibição */}
          <div className="flex items-center p-1 rounded-lg bg-slate-800/80 border border-slate-700 text-xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
                viewMode === 'grid'
                  ? 'bg-pink-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Vitrine (Grid)</span>
            </button>
            <button
              onClick={() => setViewMode('stage')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
                viewMode === 'stage'
                  ? 'bg-pink-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Palco VN (Live)</span>
            </button>
          </div>

          {/* Seletor de Fundo (para checar halos) */}
          <div className="flex items-center p-1 rounded-lg bg-slate-800/80 border border-slate-700 text-xs">
            <button
              onClick={() => setBgMode('navy')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                bgMode === 'navy' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
              title="Fundo Azul Noturno Padrão"
            >
              <Moon className="w-3.5 h-3.5 text-sky-400 inline mr-1" />
              Navy
            </button>
            <button
              onClick={() => setBgMode('black')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                bgMode === 'black' ? 'bg-black text-white font-bold border border-slate-600' : 'text-slate-400 hover:text-white'
              }`}
              title="Preto Absoluto (Checar Halos Brancos)"
            >
              Preto
            </button>
            <button
              onClick={() => setBgMode('white')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                bgMode === 'white' ? 'bg-white text-slate-900 font-bold' : 'text-slate-400 hover:text-white'
              }`}
              title="Branco Puro (Checar Integridade dos Traços)"
            >
              <Sun className="w-3.5 h-3.5 text-amber-500 inline mr-1" />
              Branco
            </button>
            <button
              onClick={() => setBgMode('checker')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                bgMode === 'checker' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
              title="Xadrez de Transparência Alfa"
            >
              Xadrez
            </button>
            <button
              onClick={() => setBgMode('game')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                bgMode === 'game' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
              title="Cenário Real do Jogo (cenário do menu)"
            >
              <Layers className="w-3.5 h-3.5 inline mr-1" />
              Cenário
            </button>
          </div>

          {/* Botão Fechar */}
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white transition-all border border-slate-700"
            title="Voltar ao Jogo"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <div className="flex-1 flex overflow-hidden">
        {/* Barra Lateral: Lista de Personagens */}
        <aside className="w-72 border-r border-slate-800 bg-slate-900/50 flex flex-col">
          <div className="p-3 border-b border-slate-800">
            <input
              type="text"
              placeholder="Buscar personagem..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-pink-500"
            />
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40 p-2 space-y-1">
            {filteredCharacters.map((charId) => {
              const meta = CHARACTERS_METADATA[charId];
              const isSelected = selectedCharId === charId;
              const hasSprites = charId !== 'protagonist';

              return (
                <button
                  key={charId}
                  onClick={() => {
                    setSelectedCharId(charId);
                    setSelectedExpression(meta.defaultExpression);
                  }}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all text-left ${
                    isSelected
                      ? 'bg-pink-600/20 border border-pink-500/40 text-white shadow-md'
                      : 'hover:bg-slate-800/60 text-slate-300 border border-transparent'
                  }`}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-inner"
                    style={{
                      backgroundColor: `${meta.themeColor}33`,
                      color: meta.themeColor,
                      border: `2px solid ${meta.themeColor}`,
                    }}
                  >
                    {meta.name.slice(0, 2).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs truncate text-slate-100">{meta.name}</span>
                      {hasSprites ? (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                          {meta.knownExpressions.length} poses
                        </span>
                      ) : (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 flex items-center gap-1 font-medium">
                          <AlertCircle className="w-2.5 h-2.5" />
                          SVG
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">{meta.title}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Painel Central */}
        <main className={`flex-1 flex flex-col relative overflow-hidden ${getBgStyle()}`}>
          {bgMode === 'game' && (
            <div className="absolute inset-0 pointer-events-none opacity-50">
              <BackgroundView backgroundId={GAME_CONFIG.menuBackground} />
            </div>
          )}

          {viewMode === 'grid' ? (
            /* Modo Vitrine / Grid de Expressões */
            <div className="flex-1 p-6 overflow-y-auto z-10">
              <div className="max-w-6xl mx-auto space-y-6">
                {/* Cabeçalho do Personagem Selecionado */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-800 text-slate-100">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg"
                      style={{
                        backgroundColor: `${currentMeta.themeColor}33`,
                        color: currentMeta.themeColor,
                        border: `2px solid ${currentMeta.themeColor}`,
                      }}
                    >
                      {currentMeta.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold flex items-center gap-2">
                        {currentMeta.name}
                        {currentMeta.nickname && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-normal">
                            "{currentMeta.nickname}"
                          </span>
                        )}
                      </h2>
                      <p className="text-xs text-slate-400">{currentMeta.title}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewMode('stage')}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold shadow-lg shadow-pink-600/30 transition-all"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Testar no Palco Live</span>
                    </button>
                  </div>
                </div>

                {/* Grade de Poses / Expressões */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {expressions.map((expr) => {
                    const spriteKey = `${selectedCharId}/${expr}`;
                    const isFailed = Boolean(failedSprites[spriteKey]);
                    const spritePath = getSpritePath(selectedCharId, expr);
                    const isSelected = selectedExpression === expr;

                    return (
                      <div
                        key={expr}
                        onClick={() => setSelectedExpression(expr)}
                        className={`group relative flex flex-col rounded-2xl border transition-all cursor-pointer overflow-hidden ${
                          isSelected
                            ? 'border-pink-500 ring-2 ring-pink-500/50 bg-slate-900/90 shadow-xl'
                            : 'border-slate-800/80 hover:border-slate-700 bg-slate-900/60 hover:bg-slate-900/90'
                        }`}
                      >
                        {/* Preview do Sprite */}
                        <div className="relative h-72 w-full flex items-end justify-center p-2 overflow-hidden bg-black/20">
                          {!isFailed ? (
                            <img
                              src={spritePath}
                              alt={`${currentMeta.name} - ${expr}`}
                              onError={() => {
                                setFailedSprites((prev) => ({ ...prev, [spriteKey]: true }));
                              }}
                              className="h-full w-auto object-contain object-bottom transition-transform duration-200 group-hover:scale-105"
                            />
                          ) : (
                            <CharacterAvatarSvg characterId={selectedCharId} expression={expr} />
                          )}
                        </div>

                        {/* Metadados do Sprite */}
                        <div className="p-3 border-t border-slate-800/80 bg-slate-950/80 flex flex-col gap-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-slate-200 truncate capitalize">
                              {expr.replace('_', ' ')}
                            </span>
                            {!isFailed ? (
                              <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                                <CheckCircle2 className="w-3 h-3" />
                                720px
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-[10px] text-amber-400 font-mono">
                                <AlertCircle className="w-3 h-3" />
                                SVG
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono truncate">{expr}.png</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* Modo Palco Live (Simulação da Visual Novel) */
            <div className="flex-1 flex flex-col relative z-10 overflow-hidden">
              {/* Controles de Palco Superior */}
              <div className="p-4 border-b border-slate-800/60 bg-slate-950/70 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-400">Expressão:</span>
                  <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                    {expressions.map((expr) => (
                      <button
                        key={expr}
                        onClick={() => setSelectedExpression(expr)}
                        className={`px-3 py-1 rounded-md text-xs transition-all capitalize ${
                          selectedExpression === expr
                            ? 'bg-pink-600 text-white font-bold shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {expr.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Gatilhos de Animação */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400">Animação:</span>
                  <button
                    onClick={() => triggerAnimation('sprite-bob')}
                    className="flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 hover:text-pink-400 transition-all"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Fala (Bob)</span>
                  </button>
                  <button
                    onClick={() => triggerAnimation('sprite-shake')}
                    className="flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 hover:text-rose-400 transition-all"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Susto (Shake)</span>
                  </button>
                  <button
                    onClick={() => triggerAnimation('slide-up-fade')}
                    className="flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 hover:text-sky-400 transition-all"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Entrada (Fade)</span>
                  </button>
                </div>

                {/* Posição, Zoom e Espelhamento */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 text-xs text-slate-400">
                    <Sliders className="w-3.5 h-3.5 text-pink-400" />
                    <span className="hidden sm:inline">Zoom:</span>
                    <input
                      type="range"
                      min="0.6"
                      max="1.4"
                      step="0.05"
                      value={scale}
                      onChange={(e) => setScale(parseFloat(e.target.value))}
                      className="w-16 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
                    />
                    <span className="font-mono text-[11px] w-8 text-slate-300">{scale.toFixed(2)}x</span>
                  </div>

                  <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
                    {(['left', 'center', 'right'] as CharacterPosition[]).map((pos) => (
                      <button
                        key={pos}
                        onClick={() => setPosition(pos)}
                        className={`px-2.5 py-1 rounded capitalize ${
                          position === pos ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {pos === 'left' ? 'Esq' : pos === 'center' ? 'Centro' : 'Dir'}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setFlipHorizontal(!flipHorizontal)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                      flipHorizontal
                        ? 'bg-pink-600/20 border-pink-500 text-pink-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Inverter (Flip)
                  </button>
                </div>
              </div>

              {/* Área do Palco */}
              <div className="flex-1 relative flex items-end justify-center overflow-hidden">
                <CharacterSprite
                  config={{
                    characterId: selectedCharId,
                    expression: selectedExpression,
                    position,
                    animation,
                    scale,
                    flipHorizontal,
                  }}
                />

                {/* Mockup da Caixa de Diálogo na Base */}
                <div className="absolute bottom-4 z-20 w-full max-w-4xl px-4 pointer-events-auto">
                  <div className="p-4 rounded-2xl bg-slate-950/85 backdrop-blur-md border border-slate-800 shadow-2xl flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span
                        className="font-bold text-sm px-3 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${currentMeta.themeColor}33`,
                          color: currentMeta.themeColor,
                          border: `1px solid ${currentMeta.themeColor}`,
                        }}
                      >
                        {currentMeta.name}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        /assets/sprites/{selectedCharId}/{selectedExpression}.png
                      </span>
                    </div>
                    <p className="text-sm text-slate-200">
                      "Olá! Este é o estúdio de inspeção visual do jogo. O sprite está renderizando com
                      proporções perfeitas, sem halos de compressão e com ancoragem fixa na linha inferior."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
