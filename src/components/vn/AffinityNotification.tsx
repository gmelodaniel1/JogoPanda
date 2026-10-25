import React from 'react';
import { AffinityToastNotification } from '../../types/game';
import { CHARACTERS_METADATA } from '../../constants/characters';
import { GAME_CONFIG } from '../../config/game.config';
import { Heart, ArrowUp, ArrowDown } from 'lucide-react';

interface AffinityNotificationProps {
  toast: AffinityToastNotification | null;
}

export const AffinityNotification: React.FC<AffinityNotificationProps> = ({ toast }) => {
  if (!toast || !toast.changes || toast.changes.length === 0) return null;

  return (
    <div
      key={toast.id}
      className="absolute top-20 right-6 z-50 pointer-events-none flex flex-col gap-2 animate-float-affinity"
    >
      {toast.changes.map((change) => {
        const meta = CHARACTERS_METADATA[change.characterId];
        const isPositive = change.delta > 0;

        return (
          <div
            key={change.characterId}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl backdrop-blur-xl border shadow-2xl ${
              isPositive
                ? 'bg-slate-900/95 border-pink-500/80 shadow-[0_10px_30px_rgba(236,72,153,0.35)]'
                : 'bg-slate-900/95 border-cyan-500/80 shadow-[0_10px_30px_rgba(6,182,212,0.35)]'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white shadow-md ${
                isPositive ? 'bg-pink-600' : 'bg-cyan-600'
              }`}
            >
              {isPositive ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 font-bold text-sm">
                <span className={isPositive ? 'text-pink-400' : 'text-cyan-400'}>
                  {isPositive ? `+${change.delta}` : change.delta} {GAME_CONFIG.affinity.shortLabel}
                </span>
                <span className="text-slate-200">• {meta?.name || change.characterId}</span>
                <Heart
                  className={`w-3.5 h-3.5 ml-0.5 ${
                    isPositive ? 'text-pink-400 fill-pink-500' : 'text-cyan-400'
                  }`}
                />
              </div>

              {(change.feedbackReason || toast.message) && (
                <span className="text-xs text-slate-300 max-w-xs leading-snug mt-0.5">
                  {change.feedbackReason || toast.message}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
