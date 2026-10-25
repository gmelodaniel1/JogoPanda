import React from 'react';
import { CharacterId } from '../../types/character';
import { CHARACTERS_METADATA } from '../../constants/characters';

interface CharacterAvatarSvgProps {
  characterId: CharacterId;
  expression: string;
  className?: string;
}

/**
 * Placeholder exibido enquanto o sprite PNG do personagem não existir em
 * public/assets/sprites/<characterId>/<expressao>.png.
 * Usa a cor temática do personagem para manter o jogo jogável sem arte final.
 */
export const CharacterAvatarSvg: React.FC<CharacterAvatarSvgProps> = ({
  characterId,
  expression,
  className = '',
}) => {
  const meta = CHARACTERS_METADATA[characterId];
  const theme = meta?.themeColor || '#64748b';

  return (
    <div className={`flex flex-col items-center justify-end h-full max-h-[85vh] ${className}`}>
      <div className="relative flex flex-col items-center">
        {/* Silhueta com tema do personagem */}
        <div
          className="w-56 h-80 rounded-t-full border-4 flex flex-col items-center justify-center p-4 backdrop-blur-md transition-all duration-300"
          style={{ borderColor: theme, backgroundColor: `${theme}22` }}
        >
          <div
            className="w-24 h-24 rounded-full border-2 mb-3 flex items-center justify-center font-bold text-3xl shadow-lg"
            style={{ borderColor: theme, color: theme, backgroundColor: '#0f172a' }}
          >
            {meta?.name?.slice(0, 2).toUpperCase() || 'VN'}
          </div>
          <div className="font-bold text-center text-lg text-slate-100">{meta?.name || characterId}</div>
          <div className="text-xs text-center text-slate-400 mt-1 uppercase tracking-wider">{meta?.title}</div>
          <div
            className="mt-4 px-3 py-1 rounded-full text-xs font-semibold"
            style={{ backgroundColor: `${theme}33`, color: theme }}
          >
            Expressão: {expression}
          </div>
        </div>
        <div className="w-64 h-6 rounded-full bg-black/40 blur-sm -mt-2"></div>
      </div>
    </div>
  );
};
