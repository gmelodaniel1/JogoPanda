import { CharacterId, CharacterPosition, SpriteAnimation } from '../types/character';
import { AffinityChange, BgmTrack, DialogueChoice, DialogueNode, DialogueScript, SfxType } from '../types/dialogue';
import { CHARACTERS_METADATA, EXTRA_CHARACTER_ALIASES } from '../constants/characters';
import { GAME_CONFIG } from '../config/game.config';
import { normalizeBackgroundId } from './assetHelper';

/**
 * Formato do JSON bruto dos episódios (src/data/episodes/episodeN.json).
 * Veja o README para um guia completo de como escrever o roteiro.
 */
export interface RawEpisodeChoice {
  text: string;
  /** Alteração de afinidade: { "<characterId>": delta }. Ex.: { "personagem_a": 5 } */
  lomChange?: Record<string, number>;
  next: string;
}

export interface RawEpisodeNode {
  id: string;
  /** Nome exibido na caixa de diálogo. "Narrador" = narração. */
  speaker: string;
  /** Id do personagem (pasta de sprites). null = narrador. */
  characterId: string | null;
  /** Expressão (nome do PNG sem extensão). null = "neutral". */
  expression: string | null;
  background: string;
  text: string;
  next?: string | null;
  choices?: RawEpisodeChoice[];
  /** Posição do sprite na tela (padrão: "center"). */
  position?: CharacterPosition;
  /** Animação de entrada do sprite (padrão: "slide-up-fade"). */
  animation?: SpriteAnimation;
  /** Trilha fixa para a cena (sobrepõe a detecção automática). */
  bgm?: BgmTrack;
  /** Efeito sonoro fixo; "none" silencia a detecção automática. */
  sfx?: SfxType | 'none';
}

export interface RawEpisode {
  episode: number;
  title: string;
  startingNodeId: string;
  nodes: Record<string, RawEpisodeNode>;
}

/** Remove acentos e normaliza para comparação de apelidos. */
function normalizeKey(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Dicionário de normalização de IDs de personagens.
 * Gerado automaticamente a partir do id, nome e apelido de cada personagem,
 * mais os aliases extras definidos em `src/constants/characters.ts`.
 */
export const CHARACTER_ID_ALIASES: Record<string, CharacterId> = (() => {
  const aliases: Record<string, CharacterId> = {};
  for (const [id, meta] of Object.entries(CHARACTERS_METADATA)) {
    const charId = id as CharacterId;
    aliases[normalizeKey(id)] = charId;
    const m = meta as { name: string; nickname?: string };
    if (m.name) aliases[normalizeKey(m.name)] = charId;
    if (m.nickname) aliases[normalizeKey(m.nickname)] = charId;
  }
  for (const [alias, id] of Object.entries(EXTRA_CHARACTER_ALIASES)) {
    aliases[normalizeKey(alias)] = id;
  }
  return aliases;
})();

/** Indica se um id/apelido bruto corresponde a algum personagem cadastrado. */
export function isKnownCharacterId(rawId: string | null | undefined): boolean {
  if (!rawId) return true;
  return normalizeKey(rawId) in CHARACTER_ID_ALIASES;
}

/**
 * Normaliza qualquer chave ou apelido para um CharacterId válido
 */
export function normalizeCharacterId(rawId: string | null | undefined): CharacterId {
  if (!rawId) return 'narrator';
  return CHARACTER_ID_ALIASES[normalizeKey(rawId)] || 'narrator';
}

/** Detecta SFX/BGM por palavras-chave configuradas em GAME_CONFIG.audioCues. */
function detectAudio(text: string): { sfx?: SfxType; bgm: BgmTrack } {
  const textLower = text.toLowerCase();
  const { audioCues } = GAME_CONFIG;

  const sfxCue = audioCues.sfx.find((cue) => cue.keywords.some((k) => textLower.includes(k)));
  const bgmCue = audioCues.bgm.find((cue) => cue.keywords.some((k) => textLower.includes(k)));

  return {
    sfx: sfxCue?.sfx,
    bgm: bgmCue?.bgm || audioCues.defaultBgm,
  };
}

/**
 * Converte um RawEpisode em um DialogueScript totalmente tipado para o motor de jogo
 */
export function parseRawEpisode(raw: RawEpisode): DialogueScript {
  const nodes: Record<string, DialogueNode> = {};

  for (const [nodeId, rawNode] of Object.entries(raw.nodes)) {
    const speakerId = normalizeCharacterId(
      rawNode.characterId || (normalizeKey(rawNode.speaker || '') === 'narrador' ? 'narrator' : rawNode.speaker)
    );
    const isNarrator = speakerId === 'narrator';

    const speakerDisplayName = isNarrator
      ? undefined
      : rawNode.speaker || CHARACTERS_METADATA[speakerId]?.name || undefined;

    const hasSprite = !isNarrator && speakerId !== 'protagonist';
    const sprite = hasSprite
      ? {
          characterId: speakerId,
          expression: rawNode.expression || 'neutral',
          position: rawNode.position || ('center' as const),
          animation: rawNode.animation || ('slide-up-fade' as const),
        }
      : undefined;

    let choices: DialogueChoice[] | undefined = undefined;
    if (rawNode.choices && rawNode.choices.length > 0) {
      choices = rawNode.choices.map((c, idx) => {
        const affinityChanges: AffinityChange[] = [];
        if (c.lomChange) {
          for (const [rawChar, delta] of Object.entries(c.lomChange)) {
            if (delta === 0) continue; // Ignora deltas neutros
            const charId = normalizeCharacterId(rawChar);
            if (charId && charId !== 'narrator' && charId !== 'protagonist') {
              affinityChanges.push({
                characterId: charId,
                delta,
              });
            }
          }
        }

        return {
          id: `${nodeId}_choice_${idx}`,
          text: c.text,
          nextNodeId: c.next,
          affinityChanges: affinityChanges.length > 0 ? affinityChanges : undefined,
        };
      });
    }

    const normBg = normalizeBackgroundId(rawNode.background);

    // Detecção contextual de SFX / BGM por palavras-chave (configurável)
    let { sfx, bgm } = detectAudio(rawNode.text);

    if (rawNode.bgm) bgm = rawNode.bgm;
    if (rawNode.sfx) sfx = rawNode.sfx === 'none' ? undefined : rawNode.sfx;

    const isEnding = !rawNode.next && (!choices || choices.length === 0);

    nodes[nodeId] = {
      id: nodeId,
      speaker: speakerId,
      speakerDisplayName,
      text: rawNode.text,
      sprite,
      background: normBg,
      sfx,
      bgm,
      choices,
      nextNodeId: rawNode.next || undefined,
      isEnding,
    };
  }

  return {
    id: `episode-${raw.episode}`,
    title: raw.title,
    description: `Episódio ${raw.episode}: ${raw.title}`,
    initialNodeId: raw.startingNodeId,
    nodes,
  };
}

/**
 * Lista ids de personagens usados no JSON bruto que não existem no elenco
 * (útil para pegar erros de digitação no roteiro).
 */
export function findUnknownCharacterIds(raw: RawEpisode): string[] {
  const unknown = new Set<string>();
  for (const node of Object.values(raw.nodes)) {
    if (node.characterId && !isKnownCharacterId(node.characterId)) unknown.add(node.characterId);
    for (const choice of node.choices || []) {
      for (const rawChar of Object.keys(choice.lomChange || {})) {
        if (!isKnownCharacterId(rawChar)) unknown.add(rawChar);
      }
    }
  }
  return [...unknown];
}

/**
 * Validador de integridade da árvore de nós de um episódio
 */
export function validateEpisodeScript(script: DialogueScript): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!script.initialNodeId) {
    errors.push(`Episódio ${script.id}: initialNodeId não definido.`);
  } else if (!script.nodes[script.initialNodeId]) {
    errors.push(`Episódio ${script.id}: initialNodeId "${script.initialNodeId}" não existe em nodes.`);
  }

  for (const [nodeId, node] of Object.entries(script.nodes)) {
    if (node.nextNodeId && !node.isEnding) {
      if (!script.nodes[node.nextNodeId]) {
        errors.push(`Nó "${nodeId}": nextNodeId "${node.nextNodeId}" não existe na árvore.`);
      }
    }

    if (node.choices) {
      node.choices.forEach((choice, idx) => {
        if (!choice.text.trim()) {
          errors.push(`Nó "${nodeId}" escolha [${idx}]: texto está vazio.`);
        }
        if (!choice.nextNodeId) {
          errors.push(`Nó "${nodeId}" escolha [${idx}]: nextNodeId está vazio.`);
        } else if (!script.nodes[choice.nextNodeId]) {
          errors.push(`Nó "${nodeId}" escolha [${idx}]: aponta para nó inexistente "${choice.nextNodeId}".`);
        }
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
