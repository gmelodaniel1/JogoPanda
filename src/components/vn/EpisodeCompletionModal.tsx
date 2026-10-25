import React, { useMemo } from 'react';
import { Award, ArrowRight, Home, RotateCcw, Heart, Sparkles, TrendingUp, TrendingDown, BookOpen } from 'lucide-react';
import { CharacterId } from '../../types/character';
import { CHARACTERS_METADATA } from '../../constants/characters';
import { getSpritePath } from '../../utils/assetHelper';
import { GAME_CONFIG } from '../../config/game.config';

interface EpisodeCompletionModalProps {
  episodeNum: number;
  scriptTitle: string;
  episodeAffinityDeltas: Partial<Record<CharacterId, number>>;
  totalAffinities: Record<CharacterId, number>;
  hasNextEpisode: boolean;
  nextEpisodeNum?: number;
  nextEpisodeTitle?: string;
  onNextEpisode: () => void;
  onReturnToMenu: () => void;
  onReplayEpisode: () => void;
}

export const EpisodeCompletionModal: React.FC<EpisodeCompletionModalProps> = ({
  episodeNum,
  scriptTitle,
  episodeAffinityDeltas,
  totalAffinities,
  hasNextEpisode,
  nextEpisodeNum,
  nextEpisodeTitle,
  onNextEpisode,
  onReturnToMenu,
  onReplayEpisode,
}) => {
  // Saldo total de afinidade conquistado/perdido no episódio
  const deltaEntries = useMemo(() => {
    return Object.entries(episodeAffinityDeltas).filter(
      ([, delta]) => typeof delta === 'number' && delta !== 0
    ) as [CharacterId, number][];
  }, [episodeAffinityDeltas]);

  const netLomDelta = useMemo(() => {
    return deltaEntries.reduce((sum, [, delta]) => sum + delta, 0);
  }, [deltaEntries]);

  const { completion, affinity } = GAME_CONFIG;
  const evaluator = completion.evaluator;

  // Avaliação do personagem avaliador baseada no saldo do episódio (faixas em game.config.ts)
  const evaluatorFeedback = useMemo(() => {
    const tiers = completion.tiers;
    return tiers.find((tier) => netLomDelta >= tier.minNetDelta) || tiers[tiers.length - 1];
  }, [netLomDelta, completion.tiers]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in pointer-events-auto">
      <div className="relative w-full max-w-3xl bg-slate-900/95 border border-pink-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(236,72,153,0.25)] text-slate-100 max-h-[92vh] flex flex-col justify-between overflow-hidden">
        {/* Glow decorativo de fundo */}
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-pink-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        {/* Cabeçalho de Conclusão */}
        <div className="relative z-10 text-center mb-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-pink-500/20 text-amber-300 border border-amber-500/40 text-xs font-black uppercase tracking-wider mb-2">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Episódio Concluído com Sucesso!</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Episódio {episodeNum}: {scriptTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {completion.subtitle}
          </p>
        </div>

        {/* Conteúdo rolável */}
        <div className="relative z-10 flex-1 overflow-y-auto space-y-5 pr-1 pb-2">
          {/* Card de Avaliação do Personagem Avaliador */}
          {evaluator && (
          <div className="relative rounded-2xl bg-slate-800/80 border border-slate-700/80 p-4 sm:p-5 flex flex-col sm:flex-row items-center sm:items-start gap-4 shadow-lg">
            {/* Mini-Avatar do Avaliador */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-slate-900 border-2 border-pink-500/40 flex-shrink-0 shadow-md">
              <img
                src={getSpritePath(evaluator.characterId, evaluatorFeedback.expression)}
                alt={evaluator.displayName}
                className="w-full h-full object-cover object-top scale-125 translate-y-1"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  const neutral = getSpritePath(evaluator.characterId, 'neutral');
                  if (!img.src.endsWith(neutral.replace(/^\./, ''))) {
                    img.src = neutral;
                  } else {
                    img.style.visibility = 'hidden';
                  }
                }}
              />
            </div>

            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-between gap-2 mb-2">
                <div>
                  <h4 className="font-bold text-white text-base">{evaluator.displayName}</h4>
                  <span className="text-[11px] text-pink-400 font-semibold">
                    {evaluator.role}
                  </span>
                </div>
                <div
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wide ${evaluatorFeedback.badgeColor}`}
                >
                  {evaluatorFeedback.badge}
                </div>
              </div>

              <blockquote className="text-xs sm:text-sm text-slate-300 italic leading-relaxed bg-slate-900/60 rounded-xl p-3 border border-slate-700/50">
                "{evaluatorFeedback.quote}"
              </blockquote>
            </div>
          </div>
          )}

          {/* Balanço de Afinidades ou Conclusão de Sobrevivência */}
          {GAME_CONFIG.hasAffinityMeter ? (
            <div className="rounded-2xl bg-slate-800/60 border border-slate-700/60 p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-pink-400 fill-pink-400" />
                  <h3 className="font-bold text-sm sm:text-base text-white">
                    Balanço de {affinity.name} do Episódio
                  </h3>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-700 text-slate-300">
                  {netLomDelta >= 0 ? (
                    <>
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Saldo Líquido:</span>
                      <span className="text-emerald-400 font-bold">+{netLomDelta} {affinity.shortLabel}</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                      <span>Saldo Líquido:</span>
                      <span className="text-rose-400 font-bold">{netLomDelta} {affinity.shortLabel}</span>
                    </>
                  )}
                </div>
              </div>

              {deltaEntries.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {deltaEntries.map(([charId, delta]) => {
                    const meta = CHARACTERS_METADATA[charId];
                    const displayName = meta?.nickname || meta?.name || charId;
                    const role = meta?.title || '';
                    const currentTotal = totalAffinities[charId] ?? 0;
                    const totalPct = Math.round(((currentTotal + 100) / 200) * 100);
                    const isPositive = delta > 0;

                    return (
                      <div
                        key={charId}
                        className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/70 border border-slate-700/60 hover:border-slate-600 transition-colors"
                      >
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-950 border border-slate-700 flex-shrink-0">
                          <img
                            src={getSpritePath(charId, isPositive ? 'happy' : 'annoyed')}
                            alt={displayName}
                            className="w-full h-full object-cover object-top scale-125"
                            onError={(e) => {
                              const img = e.target as HTMLImageElement;
                              if (img.dataset.fallback) {
                                img.style.visibility = 'hidden';
                                return;
                              }
                              img.dataset.fallback = '1';
                              img.src = getSpritePath(charId, 'neutral');
                            }}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="font-bold text-xs text-white truncate">
                              {displayName}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[11px] font-black ${
                                isPositive
                                  ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-rose-950/80 text-rose-400 border border-rose-500/30'
                              }`}
                            >
                              {isPositive ? `+${delta}` : delta} {affinity.shortLabel}
                            </span>
                          </div>

                          <div className="text-[10px] text-slate-400 truncate mb-1.5">{role}</div>

                          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isPositive
                                  ? 'bg-gradient-to-r from-pink-500 to-emerald-400'
                                  : 'bg-gradient-to-r from-pink-500 to-rose-400'
                              }`}
                              style={{ width: `${Math.max(5, Math.min(100, totalPct))}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4 text-xs text-slate-400 italic">
                  Nenhuma alteração de afinidade foi computada neste percurso.
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900/80 to-red-950/40 border border-emerald-500/30 p-5 text-center shadow-inner">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs uppercase mb-2 border border-emerald-500/30">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Vitória Canônica Alcançada</span>
              </div>
              <h3 className="text-xl font-black text-white mb-2">FIM — O Panda de Ferro Continua Inabalável!</h3>
              <p className="text-xs text-slate-300 max-w-lg mx-auto leading-relaxed">
                Você sobreviveu às armadilhas do Engenho Jussaral, derrotou os robôs golpistas e restaurou a paz na república do Panda de Ferro com a força combinada do jornalismo investigativo de Sandro Vagner e o sagrado bom dia de Conrado!
              </p>
            </div>
          )}
        </div>

        {/* Rodapé de Ações de Transição */}
        <div className="relative z-10 pt-4 mt-2 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onReturnToMenu}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs transition-colors border border-slate-700"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Menu Principal</span>
            </button>

            <button
              onClick={onReplayEpisode}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs transition-colors border border-slate-700"
              title="Jogar este episódio novamente"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Repetir</span>
            </button>
          </div>

          {hasNextEpisode ? (
            <button
              onClick={onNextEpisode}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-500 hover:to-pink-400 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-pink-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4 text-pink-200" />
              <span>
                {nextEpisodeTitle
                  ? `Iniciar Ep. ${nextEpisodeNum}: ${nextEpisodeTitle}`
                  : `Iniciar Episódio ${nextEpisodeNum}`}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Todos os episódios disponíveis foram concluídos!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
