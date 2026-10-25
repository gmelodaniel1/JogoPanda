import React, { useEffect } from 'react';
import { CharacterId } from '../../types/character';
import { CHARACTERS_METADATA } from '../../constants/characters';
import { useTypewriter } from '../../hooks/useTypewriter';
import { ChevronRight, Sparkles, Award } from 'lucide-react';

interface DialogueBoxProps {
  speaker: CharacterId;
  speakerDisplayName?: string;
  text: string;
  textSpeed: number;
  hasChoices: boolean;
  isEnding?: boolean;
  onAdvance: () => void;
  onFinishTyping: () => void;
  onSetIsTyping: (typing: boolean) => void;
}

export const DialogueBox: React.FC<DialogueBoxProps> = ({
  speaker,
  speakerDisplayName,
  text,
  textSpeed,
  hasChoices,
  isEnding,
  onAdvance,
  onFinishTyping,
  onSetIsTyping,
}) => {
  const meta = CHARACTERS_METADATA[speaker];
  const isNarrator = speaker === 'narrator';
  const isProtagonist = speaker === 'protagonist';

  const { displayedText, isTyping: hookIsTyping, skipTyping } = useTypewriter(text, {
    speed: textSpeed,
    onComplete: onFinishTyping,
  });

  // Sincroniza o estado de digitação do hook com o motor do jogo
  useEffect(() => {
    onSetIsTyping(hookIsTyping);
  }, [hookIsTyping, onSetIsTyping]);

  // Suporte a teclado: Tecla Espaço ou Enter para avançar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        if (hookIsTyping) {
          skipTyping();
        } else if (!hasChoices) {
          onAdvance();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hookIsTyping, hasChoices, skipTyping, onAdvance]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hookIsTyping) {
      skipTyping();
    } else if (!hasChoices) {
      onAdvance();
    }
  };

  const displayName = speakerDisplayName || meta?.name || '';
  const themeColor = meta?.themeColor || '#ef4444';
  const roleTitle = meta?.title || '';

  return (
    <div
      onClick={handleClick}
      className="relative z-50 w-full max-w-5xl mx-auto px-2 sm:px-4 pb-2 sm:pb-3 cursor-pointer select-none mb-[env(safe-area-inset-bottom,0px)]"
    >
      <div className="relative rounded-xl sm:rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 shadow-[0_12px_35px_rgba(0,0,0,0.6)] p-3.5 sm:p-5 md:p-6 transition-all duration-300 hover:border-slate-600">
        {/* Glow sutil baseado no personagem */}
        <div
          className="absolute inset-0 rounded-xl sm:rounded-2xl opacity-15 pointer-events-none transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle at 10% 20%, ${themeColor}, transparent 60%)`,
          }}
        />

        {/* Placa com Nome do Personagem (Oculta para o Narrador) */}
        {!isNarrator && (
          <div className="absolute -top-3.5 sm:-top-5 left-3 sm:left-6 flex items-center gap-1.5 sm:gap-2">
            <div
              className="px-3 py-0.5 sm:px-4 sm:py-1 rounded-lg sm:rounded-xl font-bold text-xs sm:text-base md:text-lg tracking-wide text-white shadow-lg flex items-center gap-1.5 border border-white/20"
              style={{ backgroundColor: themeColor }}
            >
              {isProtagonist && <Sparkles className="w-3.5 h-3.5 text-pink-200" />}
              <span>{displayName}</span>
            </div>

            {/* Badge de Cargo / Função do personagem */}
            {roleTitle && (
              <span className="hidden md:inline-block px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-slate-800/90 text-slate-300 border border-slate-700">
                {roleTitle}
              </span>
            )}
          </div>
        )}

        {/* Caixa de Texto com efeito Typewriter */}
        <div className="min-h-[50px] sm:min-h-[64px] md:min-h-[76px] pt-1">
          <p
            className={`text-xs sm:text-base md:text-lg leading-relaxed tracking-wide ${
              isNarrator
                ? 'italic text-slate-300 font-light'
                : 'text-slate-100 font-normal'
            }`}
          >
            {displayedText}
            {hookIsTyping && (
              <span className="inline-block w-1.5 sm:w-2 h-4 sm:h-5 ml-1 bg-red-500 animate-blink align-middle" />
            )}
          </p>
        </div>

        {/* Indicador de avanço (pisca quando o texto termina de digitar e não há escolhas) */}
        {!hookIsTyping && !hasChoices && !isEnding && (
          <div className="absolute bottom-2 sm:bottom-3 right-3 sm:right-5 flex items-center gap-1 text-red-400 font-bold text-[10px] sm:text-xs animate-bounce tracking-wider uppercase">
            <span>Toque para avançar</span>
            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        )}

        {/* Indicador de Escolha Pendente */}
        {!hookIsTyping && hasChoices && (
          <div className="absolute bottom-2 sm:bottom-3 right-3 sm:right-5 flex items-center gap-1 text-amber-400 font-bold text-[10px] sm:text-xs tracking-wider uppercase animate-pulse">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>Faça sua escolha acima</span>
          </div>
        )}

        {/* Indicador de Conclusão de Episódio */}
        {isEnding && !hookIsTyping && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAdvance();
            }}
            className="absolute bottom-2 sm:bottom-3 right-3 sm:right-5 flex items-center gap-1 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-lg sm:rounded-xl bg-gradient-to-r from-amber-500 to-red-500 hover:from-amber-400 hover:to-red-400 text-white font-bold text-[10px] sm:text-xs uppercase tracking-wider shadow-lg animate-pulse transition-all cursor-pointer pointer-events-auto"
          >
            <span>Concluir História</span>
            <Award className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
