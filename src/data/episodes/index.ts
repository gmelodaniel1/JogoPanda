import rawEpisode1 from './episode1.json';
import { findUnknownCharacterIds, parseRawEpisode, RawEpisode } from '../../utils/episodeParser';
import { BackgroundId } from '../../types/dialogue';
import { CharacterId } from '../../types/character';
import { DialogueScript } from '../../types/dialogue';

/**
 * ============================================================================
 *  CATÁLOGO DE EPISÓDIOS
 * ============================================================================
 * Para adicionar um episódio:
 *   1. Crie `episodeN.json` nesta pasta (copie episode1.json como modelo).
 *   2. Importe o JSON aqui em cima: `import rawEpisode2 from './episode2.json';`
 *   3. Adicione uma entrada em EPISODE_DEFINITIONS abaixo.
 * O número, o menu de episódios, o progresso e o "próximo episódio" se ajustam sozinhos.
 * ============================================================================
 */

interface EpisodeDefinition {
  raw: RawEpisode;
  /** Sinopse exibida no seletor de episódios. */
  description: string;
  /** Cenário usado como capa do card no seletor. */
  background: BackgroundId;
  /** Duração estimada exibida no card. */
  duration: string;
  /** Personagens destacados no card. */
  featuredCharacters: CharacterId[];
  /** false = aparece bloqueado no seletor. */
  unlocked: boolean;
}

const EPISODE_DEFINITIONS: EpisodeDefinition[] = [
  {
    raw: rawEpisode1 as unknown as RawEpisode,
    description: 'Sinopse do episódio 1. Edite em src/data/episodes/index.ts.',
    background: 'cenario_exemplo',
    duration: '~5 min',
    featuredCharacters: ['personagem_a', 'personagem_b'],
    unlocked: true,
  },
];

export interface EpisodeMetadata {
  number: number;
  title: string;
  description: string;
  background: BackgroundId;
  duration: string;
  featuredCharacters: CharacterId[];
  unlocked: boolean;
  script: DialogueScript;
}

export const EPISODES_METADATA: EpisodeMetadata[] = EPISODE_DEFINITIONS.map((def) => {
  const unknownIds = findUnknownCharacterIds(def.raw);
  if (unknownIds.length > 0) {
    console.warn(
      `[Episódio ${def.raw.episode}] Personagens não cadastrados em src/constants/characters.ts: ${unknownIds.join(', ')}`
    );
  }
  const script = parseRawEpisode(def.raw);
  return {
    number: def.raw.episode,
    title: script.title,
    description: def.description,
    background: def.background,
    duration: def.duration,
    featuredCharacters: def.featuredCharacters,
    unlocked: def.unlocked,
    script,
  };
});

export const EPISODE_NUMBERS: number[] = EPISODES_METADATA.map((ep) => ep.number);
export const TOTAL_EPISODES = EPISODE_NUMBERS.length;
export const FIRST_EPISODE_NUM = EPISODE_NUMBERS[0] ?? 1;

export const ALL_EPISODES: Record<number, DialogueScript> = EPISODES_METADATA.reduce(
  (acc, ep) => {
    acc[ep.number] = ep.script;
    return acc;
  },
  {} as Record<number, DialogueScript>
);
