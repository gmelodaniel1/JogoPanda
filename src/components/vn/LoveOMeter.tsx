import React, { useState } from 'react';
import { CharacterId } from '../../types/character';
import { CHARACTERS_METADATA, AFFINITY_ROSTER_IDS } from '../../constants/characters';
import { GAME_CONFIG } from '../../config/game.config';
import { Heart, Users, ChevronDown } from 'lucide-react';

interface LoveOMeterProps {
  activeCharacterId?: CharacterId;
  affinities: Record<CharacterId, number>;
}

/**
 * Medidor de afinidade / status exibido no HUD.
 * O nome exibido é configurável em GAME_CONFIG.affinity.
 */
export const LoveOMeter: React.FC<LoveOMeterProps> = ({
  activeCharacterId,
  affinities,
}) => {
  const [showRoster, setShowRoster] = useState(false);

  // Se o speaker for narrator ou protagonist, exibe o personagem padrão configurado
  const targetId: CharacterId =
    activeCharacterId && activeCharacterId !== 'narrator' && activeCharacterId !== 'protagonist'
      ? activeCharacterId
      : GAME_CONFIG.defaultMeterCharacterId;

  const meta: { name: string; nickname?: string } =
    CHARACTERS_METADATA[targetId] || CHARACTERS_METADATA[GAME_CONFIG.defaultMeterCharacterId];
  const currentLom = affinities[targetId] || 0;

  // Normaliza de [-100, 100] para porcentagem visual [0%, 100%]
  const percentage = Math.round(((currentLom + 100) / 200) * 100);

  // Determina cor do medidor baseado no nível de afinidade
  const getLomColor = (val: number) => {
    if (val < -20) return 'from-blue-600 to-cyan-500'; // Frio / Bronca
    if (val < 20) return 'from-slate-500 to-slate-400'; // Neutro
    if (val < 60) return 'from-pink-500 to-rose-400';   // Simpatia
    return 'from-rose-500 via-pink-500 to-amber-400';   // Alta afinidade / Respeito
  };

  return (
    <div className="relative z-30 flex items-center gap-2">
      {/* Medidor do Personagem Atual em Foco */}
      <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-900/85 backdrop-blur-md border border-slate-700 shadow-lg">
        {/* Ícone de Coração com pulso sutil */}
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors duration-300 ${
            currentLom >= 20
              ? 'bg-pink-500/20 text-pink-400'
              : currentLom < -20
              ? 'bg-blue-500/20 text-blue-400'
              : 'bg-slate-700/50 text-slate-300'
          }`}
        >
          <Heart
            className={`w-4 h-4 ${currentLom > 40 ? 'animate-pulse fill-pink-500' : ''}`}
          />
        </div>

        {/* Informações de Nome e Barra */}
        <div className="flex flex-col min-w-[120px] sm:min-w-[150px]">
          <div className="flex items-center justify-between text-xs font-bold leading-tight mb-1">
            <span className="text-slate-200 truncate max-w-[100px]">{meta.nickname || meta.name}</span>
            <span
              className={`font-mono text-[11px] ${
                currentLom > 0
                  ? 'text-pink-400'
                  : currentLom < 0
                  ? 'text-cyan-400'
                  : 'text-slate-400'
              }`}
            >
              {currentLom > 0 ? `+${currentLom}` : currentLom}%
            </span>
          </div>

          {/* Barra de Progresso */}
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden border border-slate-700/60 p-[1px]">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${getLomColor(
                currentLom
              )} transition-all duration-500 ease-out`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Botão para ver todos os NPCs */}
        <button
          onClick={() => setShowRoster(!showRoster)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          title="Ver afinidade de todos os personagens"
        >
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showRoster ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Dropdown com a lista de afinidades de todos os personagens */}
      {showRoster && (
        <div className="absolute top-12 left-0 w-72 max-h-96 overflow-y-auto rounded-xl bg-slate-900/95 backdrop-blur-xl border border-slate-700 shadow-2xl p-3 z-50 animate-slide-up-fade">
          <div className="flex items-center gap-2 pb-2 mb-2 border-b border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-400">
            <Users className="w-4 h-4 text-pink-400" />
            <span>
              {GAME_CONFIG.affinity.name} ({GAME_CONFIG.affinity.shortLabel})
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {AFFINITY_ROSTER_IDS.map((cid) => {
              const char = CHARACTERS_METADATA[cid];
              const lom = affinities[cid] || 0;
              const pct = Math.round(((lom + 100) / 200) * 100);

              return (
                <div key={cid} className="flex items-center justify-between text-xs py-1">
                  <div className="flex flex-col max-w-[130px]">
                    <span className="font-semibold text-slate-200 truncate">{char.name}</span>
                    <span className="text-[10px] text-slate-400 truncate">{char.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${getLomColor(lom)} transition-all duration-300`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="font-mono text-[10px] w-7 text-right text-slate-300">
                      {lom > 0 ? `+${lom}` : lom}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
