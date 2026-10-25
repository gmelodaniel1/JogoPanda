import React from 'react';
import { X, Heart, Award, Sparkles, BookOpen } from 'lucide-react';
import { CHARACTERS_METADATA, AFFINITY_ROSTER_IDS } from '../../constants/characters';
import { GAME_CONFIG } from '../../config/game.config';

interface CreditsModalProps {
  onClose: () => void;
}

export const CreditsModal: React.FC<CreditsModalProps> = ({ onClose }) => {
  const { credits } = GAME_CONFIG;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900/95 border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl text-slate-200 max-h-[90vh] overflow-y-auto">
        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cabeçalho */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Sobre o Projeto
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {GAME_CONFIG.title}
          </h2>
          <p className="text-sm text-slate-400 mt-1">{GAME_CONFIG.tagline}</p>
        </div>

        {/* Conteúdo */}
        <div className="space-y-5 text-sm sm:text-base leading-relaxed text-slate-300">
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <h3 className="font-bold text-white text-base mb-1.5 flex items-center gap-2">
              <Award className="w-4 h-4 text-pink-400" />
              {credits.aboutTitle}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">{credits.aboutText}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <h3 className="font-bold text-white text-base mb-1.5 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              {credits.castTitle}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mb-3">{credits.castIntro}</p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-slate-300">
              {AFFINITY_ROSTER_IDS.map((cid) => {
                const char = CHARACTERS_METADATA[cid];
                return (
                  <li key={cid} className="flex items-center gap-1.5 truncate">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: char.themeColor }}
                    />
                    <strong>{char.name}</strong>
                    <span className="text-slate-400 text-[11px] truncate">({char.title})</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-pink-950/20 border border-pink-500/20 text-center">
            <p className="text-xs text-pink-200 flex items-center justify-center gap-1.5 font-medium">
              {credits.footer}{' '}
              <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500 inline" />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
