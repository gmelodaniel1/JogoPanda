import React from 'react';
import { DialogueChoice } from '../../types/dialogue';
import { Sparkles } from 'lucide-react';

interface ChoiceMenuProps {
  choices: DialogueChoice[];
  onSelectChoice: (choice: DialogueChoice) => void;
}

export const ChoiceMenu: React.FC<ChoiceMenuProps> = ({ choices, onSelectChoice }) => {
  if (!choices || choices.length === 0) return null;

  return (
    <div className="absolute inset-x-0 top-12 sm:top-16 bottom-36 sm:bottom-48 z-40 flex flex-col justify-center items-center px-3 sm:px-6 pointer-events-auto bg-slate-950/50 backdrop-blur-[2px] animate-fade-in">
      <div className="w-full max-w-2xl max-h-full flex flex-col overflow-y-auto pr-1 py-1">
        <div className="text-center mb-2 flex-shrink-0">
          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 sm:px-3.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest bg-red-500/20 text-red-300 border border-red-500/30">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Escolha seu destino
          </span>
        </div>

        <div className="flex flex-col gap-2 sm:gap-2.5 w-full">
          {choices.map((choice, index) => (
            <button
              key={choice.id || index}
              onClick={() => onSelectChoice(choice)}
              className="group relative w-full text-left p-3 sm:p-4 rounded-xl bg-slate-900/95 hover:bg-slate-800/95 active:bg-slate-800 border border-slate-700/90 hover:border-red-500 transition-all duration-200 transform hover:-translate-y-0.5 active:scale-[0.99] hover:shadow-[0_8px_25px_rgba(239,68,68,0.25)] flex items-start gap-2.5 sm:gap-3 select-none cursor-pointer"
            >
              {/* Indicador numérico */}
              <div className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-slate-800 group-hover:bg-red-600 flex items-center justify-center text-[11px] sm:text-xs font-bold text-slate-300 group-hover:text-white transition-colors duration-200 mt-0.5 border border-slate-700 group-hover:border-red-400">
                {index + 1}
              </div>

              {/* Texto da escolha */}
              <div className="flex-1 text-xs sm:text-sm md:text-base font-medium text-slate-100 group-hover:text-white leading-snug">
                {choice.text}
              </div>

              {/* Glow sutil */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-500/0 via-red-500/5 to-red-500/0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
