import React, { useState, useEffect } from 'react';
import { X, Save, Upload, Trash2, Clock, Check, Sparkles } from 'lucide-react';
import { GameSaveSlot, SaveSlotId } from '../../types/save';
import { saveManager } from '../../utils/saveManager';
import { getBackgroundPath } from '../../utils/assetHelper';
import { soundEngine } from '../../utils/soundEngine';

export type SaveLoadMode = 'save' | 'load';

interface SaveLoadModalProps {
  isOpen: boolean;
  initialMode: SaveLoadMode;
  onClose: () => void;
  onSaveToSlot?: (slotId: SaveSlotId) => void;
  onLoadFromSlot: (save: GameSaveSlot) => void;
  canSave?: boolean; // false se aberto pelo Menu Principal
}

const MANUAL_SLOTS: { id: SaveSlotId; label: string }[] = [
  { id: 'slot_1', label: 'Slot 1' },
  { id: 'slot_2', label: 'Slot 2' },
  { id: 'slot_3', label: 'Slot 3' },
  { id: 'slot_4', label: 'Slot 4' },
];

function formatTimestamp(ts: number): string {
  try {
    const d = new Date(ts);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month} às ${hours}:${minutes}`;
  } catch {
    return 'Data desconhecida';
  }
}

export const SaveLoadModal: React.FC<SaveLoadModalProps> = ({
  isOpen,
  initialMode,
  onClose,
  onSaveToSlot,
  onLoadFromSlot,
  canSave = true,
}) => {
  const [activeTab, setActiveTab] = useState<SaveLoadMode>(initialMode);
  const [slotsData, setSlotsData] = useState<Record<SaveSlotId, GameSaveSlot | null>>(() =>
    saveManager.getAllSlots()
  );
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(canSave ? initialMode : 'load');
      setSlotsData(saveManager.getAllSlots());
      setFeedbackMessage(null);
    }
  }, [isOpen, initialMode, canSave]);

  const refreshSlots = () => {
    setSlotsData(saveManager.getAllSlots());
  };

  const handleSave = (slotId: SaveSlotId) => {
    if (!onSaveToSlot) return;
    soundEngine.playClick();
    onSaveToSlot(slotId);
    refreshSlots();
    setFeedbackMessage(`Jogo salvo com sucesso no ${slotId === 'autosave' ? 'Auto-Save' : slotId.replace('slot_', 'Slot ')}!`);
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  const handleLoad = (save: GameSaveSlot) => {
    soundEngine.playClick();
    onLoadFromSlot(save);
    onClose();
  };

  const handleDelete = (slotId: SaveSlotId, e: React.MouseEvent) => {
    e.stopPropagation();
    soundEngine.playClick();
    saveManager.deleteSlot(slotId);
    refreshSlots();
  };

  const autoSave = slotsData['autosave'];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in pointer-events-auto">
      <div className="relative w-full max-w-4xl bg-slate-900/95 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 max-h-[92vh] flex flex-col justify-between overflow-hidden">
        {/* Glow decorativo de fundo */}
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-pink-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />

        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors z-20"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cabeçalho e Seleção de Abas */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
              {activeTab === 'save' ? (
                <>
                  <Save className="w-6 h-6 text-pink-400" />
                  <span>Salvar Progresso</span>
                </>
              ) : (
                <>
                  <Upload className="w-6 h-6 text-sky-400" />
                  <span>Carregar Sessão</span>
                </>
              )}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {activeTab === 'save'
                ? 'Escolha um dos slots disponíveis para registrar seu momento na história'
                : 'Selecione qualquer ponto salvo ou o salvamento automático recente'}
            </p>
          </div>

          {/* Abas Alternáveis */}
          {canSave && (
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/80 border border-slate-700/70">
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setActiveTab('save');
                }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'save'
                    ? 'bg-pink-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Save className="w-3.5 h-3.5" />
                <span>Salvar</span>
              </button>

              <button
                onClick={() => {
                  soundEngine.playClick();
                  setActiveTab('load');
                }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'load'
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Carregar</span>
              </button>
            </div>
          )}
        </div>

        {/* Feedback visual de confirmação */}
        {feedbackMessage && (
          <div className="relative z-10 mb-4 px-4 py-2.5 rounded-xl bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fade-in shadow-lg">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{feedbackMessage}</span>
          </div>
        )}

        {/* Lista de Slots de Salvamento */}
        <div className="relative z-10 flex-1 overflow-y-auto space-y-4 pr-1 pb-2">
          {/* Card de Auto-Save */}
          <div className="rounded-2xl bg-slate-800/60 border border-pink-500/30 p-4 sm:p-5 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-pink-400" />
                <h3 className="font-bold text-sm sm:text-base text-white">Salvamento Automático (Auto-Save)</h3>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-pink-500/20 text-pink-300 border border-pink-500/30">
                Gravação Silenciosa
              </span>
            </div>

            {autoSave ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3 rounded-xl bg-slate-900/80 border border-slate-700/60 hover:border-slate-600 transition-colors">
                {/* Thumbnail do Cenário */}
                <div className="relative w-full sm:w-36 h-20 rounded-lg overflow-hidden bg-slate-950 flex-shrink-0 border border-slate-700">
                  <img
                    src={getBackgroundPath(autoSave.background)}
                    alt="Cenário salvo"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded bg-slate-900/90 text-[10px] font-bold text-pink-300 border border-slate-700">
                    Ep. {autoSave.episodeNum}
                  </div>
                </div>

                {/* Dados da Cena */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{formatTimestamp(autoSave.timestamp)}</span>
                    <span>•</span>
                    <span className="font-bold text-pink-300">{autoSave.speakerDisplayName || autoSave.speaker}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 line-clamp-2 italic leading-relaxed">
                    "{autoSave.previewText}"
                  </p>
                </div>

                {/* Ação */}
                <button
                  onClick={() => handleLoad(autoSave)}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Restaurar</span>
                </button>
              </div>
            ) : (
              <div className="text-xs text-slate-400 italic p-3 rounded-xl bg-slate-900/40 border border-slate-800 text-center">
                Nenhum ponto automático registrado ainda. Ele é gravado automaticamente ao jogar.
              </div>
            )}
          </div>

          {/* Grid de Slots Manuais */}
          <div>
            <h3 className="font-bold text-sm text-slate-300 mb-3 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Slots de Salvamento Manual</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {MANUAL_SLOTS.map(({ id, label }) => {
                const save = slotsData[id];
                const isOccupied = Boolean(save);

                return (
                  <div
                    key={id}
                    className={`relative rounded-2xl p-4 border transition-all duration-200 flex flex-col justify-between ${
                      isOccupied
                        ? 'bg-slate-800/80 border-slate-700 hover:border-slate-600 shadow-md'
                        : 'bg-slate-900/50 border-slate-800 border-dashed text-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-white">{label}</span>
                        {isOccupied && save && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900 text-pink-300 border border-slate-700">
                            Episódio {save.episodeNum}
                          </span>
                        )}
                      </div>

                      {isOccupied && save && (
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-400">
                            {formatTimestamp(save.timestamp)}
                          </span>
                          <button
                            onClick={(e) => handleDelete(id, e)}
                            className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition-colors"
                            title="Excluir este save"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {isOccupied && save ? (
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-24 h-16 rounded-lg overflow-hidden bg-slate-950 flex-shrink-0 border border-slate-700">
                          <img
                            src={getBackgroundPath(save.background)}
                            alt="Cenário"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[11px] font-bold text-pink-300 mb-0.5 truncate">
                            {save.speakerDisplayName || save.speaker}
                          </div>
                          <p className="text-xs text-slate-300 line-clamp-2 italic leading-snug">
                            "{save.previewText}"
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="py-6 text-center text-xs text-slate-500 italic">
                        [Slot Vazio]
                      </div>
                    )}

                    {/* Botões de Ação por Slot */}
                    <div className="pt-2 border-t border-slate-700/60 flex items-center gap-2">
                      {activeTab === 'save' ? (
                        <button
                          onClick={() => handleSave(id)}
                          className={`w-full py-2 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                            isOccupied
                              ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-md'
                              : 'bg-pink-600 hover:bg-pink-500 text-white shadow-md'
                          }`}
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>{isOccupied ? 'Sobrescrever Slot' : 'Salvar Neste Slot'}</span>
                        </button>
                      ) : (
                        <button
                          disabled={!isOccupied || !save}
                          onClick={() => save && handleLoad(save)}
                          className={`w-full py-2 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                            isOccupied
                              ? 'bg-sky-600 hover:bg-sky-500 text-white shadow-md'
                              : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                          }`}
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{isOccupied ? 'Carregar Save' : 'Slot Vazio'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
