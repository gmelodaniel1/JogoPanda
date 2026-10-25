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
    <div className="absolute inset-0 z-40 flex flex-col justify-center items-center p-4 pb-52 sm:pb-56 bg-slate-950/35 backdrop-blur-[2px] animate-fade-in">
      <div className="w-full max-w-2xl flex flex-col gap-3.5">
        <div className="text-center mb-1">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-pink-500/20 text-pink-300 border border-pink-500/30">
            <Sparkles className="w-3.5 h-3.5" /> Escolha sua resposta
          </span>
        </div>

        {choices.map((choice, index) => (
          <button
            key={choice.id || index}
            onClick={() => onSelectChoice(choice)}
            className="group relative w-full text-left p-4 sm:p-5 rounded-xl bg-slate-900/90 hover:bg-slate-800/95 border border-slate-700/80 hover:border-pink-500 transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-[0_10px_25px_rgba(236,72,153,0.25)] flex items-start gap-3 select-none"
          >
            {/* Indicador de número / bala */}
            <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-slate-800 group-hover:bg-pink-600 flex items-center justify-center text-xs font-bold text-slate-300 group-hover:text-white transition-colors duration-200 mt-0.5 border border-slate-700 group-hover:border-pink-400">
              {index + 1}
            </div>

            {/* Texto da escolha */}
            <div className="flex-1 text-sm sm:text-base font-medium text-slate-200 group-hover:text-white leading-snug">
              {choice.text}
            </div>

            {/* Brilho hover sutil */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-pink-500/0 via-pink-500/5 to-pink-500/0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300" />
          </button>
        ))}
      </div>
    </div>
  );
};

