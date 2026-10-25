import React from 'react';
import { X, Play, BookOpen, Clock, Users, ArrowRight, Unlock, Lock, CheckCircle2 } from 'lucide-react';
import { EPISODES_METADATA, EpisodeMetadata } from '../../data/episodes';
import { CHARACTERS_METADATA } from '../../constants/characters';
import { getBackgroundPath } from '../../utils/assetHelper';

interface EpisodeSelectModalProps {
  onClose: () => void;
  onSelectEpisode: (episodeNum: number) => void;
  currentEpisodeNum: number;
  completedEpisodes?: number[];
}

export const EpisodeSelectModal: React.FC<EpisodeSelectModalProps> = ({
  onClose,
  onSelectEpisode,
  currentEpisodeNum,
  completedEpisodes = [],
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl bg-slate-900/95 border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl text-slate-200 max-h-[90vh] flex flex-col">
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
            <BookOpen className="w-3.5 h-3.5" /> Seletor de Capítulos
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Escolha seu Episódio
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Selecione qualquer um dos três episódios disponíveis para jogar imediatamente
          </p>
        </div>

        {/* Lista de Episódios */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 overflow-y-auto pr-1 pb-2">
          {EPISODES_METADATA.map((ep: EpisodeMetadata) => {
            const isCurrent = ep.number === currentEpisodeNum;
            const isCompleted = completedEpisodes.includes(ep.number);
            const bgUrl = getBackgroundPath(ep.background);
            const charNames = ep.featuredCharacters.map(
              (cid) => CHARACTERS_METADATA[cid]?.nickname || CHARACTERS_METADATA[cid]?.name || cid
            );

            return (
              <div
                key={ep.number}
                className={`relative group rounded-xl overflow-hidden border flex flex-col justify-between transition-all duration-300 ${
                  isCurrent
                    ? 'border-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.3)] bg-slate-800/90'
                    : isCompleted
                    ? 'border-amber-500/50 hover:border-amber-400 bg-slate-800/60 hover:bg-slate-800/90'
                    : 'border-slate-700/80 hover:border-slate-500 bg-slate-800/50 hover:bg-slate-800/80'
                }`}
              >
                {/* Imagem de Capa */}
                <div className="relative h-36 w-full overflow-hidden bg-slate-950">
                  <img
                    src={bgUrl}
                    alt={ep.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />

                  {/* Badge de Número do Episódio */}
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-slate-900/90 backdrop-blur-sm border border-slate-700/80 text-xs font-bold text-pink-300 flex items-center gap-1">
                    <span>EPISÓDIO {ep.number}</span>
                  </div>

                  {/* Status Desbloqueado / Bloqueado / Concluído & Duração */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    {isCompleted ? (
                      <div className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border bg-amber-950/90 text-amber-300 border-amber-500/40">
                        <CheckCircle2 className="w-2.5 h-2.5 text-amber-400" />
                        <span>Concluído</span>
                      </div>
                    ) : (
                      <div
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border ${
                          ep.unlocked
                            ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/40'
                            : 'bg-slate-900/90 text-slate-400 border-slate-700'
                        }`}
                      >
                        {ep.unlocked ? (
                          <>
                            <Unlock className="w-2.5 h-2.5" />
                            <span>Desbloqueado</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-2.5 h-2.5" />
                            <span>Bloqueado</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="absolute bottom-2 right-3 px-2 py-0.5 rounded-md bg-slate-900/80 text-[11px] text-slate-300 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{ep.duration}</span>
                  </div>
                </div>

                {/* Conteúdo do Card */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-white text-base leading-snug mb-2 group-hover:text-pink-300 transition-colors">
                      {ep.title}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed mb-3 line-clamp-3">
                      {ep.description}
                    </p>
                  </div>

                  {/* Personagens Presentes */}
                  <div className="mb-4 pt-2 border-t border-slate-700/60">
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 font-semibold mb-1">
                      <Users className="w-3 h-3 text-pink-400" />
                      <span>Personagens:</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {charNames.slice(0, 4).map((c, i) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.5 rounded bg-slate-700/50 text-[10px] text-slate-300"
                        >
                          {c}
                        </span>
                      ))}
                      {charNames.length > 4 && (
                        <span className="px-1 py-0.5 text-[10px] text-slate-400">
                          +{charNames.length - 4}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Botão de Ação */}
                  <button
                    disabled={!ep.unlocked}
                    onClick={() => {
                      if (!ep.unlocked) return;
                      onSelectEpisode(ep.number);
                      onClose();
                    }}
                    className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md ${
                      !ep.unlocked
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : isCurrent
                        ? 'bg-pink-600 hover:bg-pink-500 text-white'
                        : isCompleted
                        ? 'bg-amber-600/90 hover:bg-amber-500 text-white'
                        : 'bg-slate-700 hover:bg-pink-600 text-slate-200 hover:text-white'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>
                      {isCurrent
                        ? 'Continuar Jogando'
                        : isCompleted
                        ? `Jogar Novamente (Ep. ${ep.number})`
                        : `Iniciar Episódio ${ep.number}`}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
