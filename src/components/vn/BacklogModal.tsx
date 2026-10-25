import React from 'react';
import { DialogueHistoryItem } from '../../types/game';
import { CHARACTERS_METADATA } from '../../constants/characters';
import { X, History, Sparkles } from 'lucide-react';

interface BacklogModalProps {
  isOpen: boolean;
  history: DialogueHistoryItem[];
  onClose: () => void;
}

export const BacklogModal: React.FC<BacklogModalProps> = ({
  isOpen,
  history,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-3xl h-[80vh] flex flex-col rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <History className="w-5 h-5 text-pink-400" />
            <h2 className="font-bold text-lg text-slate-100">Histórico de Diálogos (Backlog)</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lista de Falas Anteriores */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {history.length === 0 ? (
            <div className="text-center text-slate-500 py-12">
              Nenhuma linha de diálogo registrada ainda.
            </div>
          ) : (
            history.map((item) => {
              const meta = CHARACTERS_METADATA[item.speaker];
              const isNarrator = item.speaker === 'narrator';
              const isProtagonist = item.speaker === 'protagonist';
              const themeColor = meta?.themeColor || '#ec4899';

              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 transition-colors hover:border-slate-600"
                >
                  {!isNarrator && (
                    <div className="flex items-center gap-2 mb-1.5">
                      <span
                        className="font-bold text-xs px-2.5 py-0.5 rounded-md text-white shadow-sm flex items-center gap-1"
                        style={{ backgroundColor: themeColor }}
                      >
                        {isProtagonist && <Sparkles className="w-3 h-3 text-pink-200" />}
                        {item.speakerName}
                      </span>
                    </div>
                  )}

                  <p
                    className={`text-sm sm:text-base leading-relaxed ${
                      isNarrator ? 'italic text-slate-400 font-light' : 'text-slate-200'
                    }`}
                  >
                    {item.text}
                  </p>

                  {/* Opção que o jogador escolheu nesta ramificação */}
                  {item.chosenOption && (
                    <div className="mt-2.5 pt-2 border-t border-slate-700/40 text-xs text-pink-300 flex items-start gap-1.5 font-medium">
                      <span className="font-bold text-pink-400">Sua escolha:</span>
                      <span>{item.chosenOption}</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Rodapé */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/40 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

