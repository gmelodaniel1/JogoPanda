import type { CharacterMeta } from '../types/character';

/**
 * ============================================================================
 *  ELENCO DO JOGO
 * ============================================================================
 * Cada chave deste objeto é o `characterId` usado:
 *   - nos JSONs dos episódios (`characterId` e `lomChange`);
 *   - no nome da pasta de sprites: public/assets/sprites/<characterId>/<expressao>.png
 *
 * Para adicionar um personagem: copie um bloco, troque a chave e os dados,
 * e inclua o id em AFFINITY_ROSTER_IDS (se ele tiver medidor de afinidade).
 *
 * `protagonist` e `narrator` são obrigatórios — o motor depende deles.
 * ============================================================================
 */
const _RAW_CHARACTERS = {
  personagem_a: {
    id: 'personagem_a',
    name: 'Personagem A',
    title: 'Descrição curta / papel na história',
    hasRomanceRoute: true,
    themeColor: '#ec4899',
    badgeColor: '#db2777',
    defaultExpression: 'neutral',
    knownExpressions: ['neutral', 'happy', 'sad', 'surprised'],
  },
  personagem_b: {
    id: 'personagem_b',
    name: 'Personagem B',
    title: 'Descrição curta / papel na história',
    hasRomanceRoute: false,
    themeColor: '#0ea5e9',
    badgeColor: '#0284c7',
    defaultExpression: 'neutral',
    knownExpressions: ['neutral', 'happy', 'angry'],
  },

  // --- Obrigatórios -------------------------------------------------------
  protagonist: {
    id: 'protagonist',
    name: 'Você',
    title: 'Protagonista',
    hasRomanceRoute: false,
    themeColor: '#a855f7',
    badgeColor: '#9333ea',
    defaultExpression: 'neutral',
    knownExpressions: ['neutral'],
  },
  narrator: {
    id: 'narrator',
    name: '',
    title: 'Narrador',
    hasRomanceRoute: false,
    themeColor: '#94a3b8',
    badgeColor: '#64748b',
    defaultExpression: 'neutral',
    knownExpressions: ['neutral'],
  },
} satisfies Record<string, CharacterMeta>;

/** Identificador válido de personagem (derivado automaticamente das chaves acima). */
export type CharacterId = keyof typeof _RAW_CHARACTERS;

/** Metadados de todos os personagens indexados por CharacterId. */
export const CHARACTERS_METADATA: Record<CharacterId, CharacterMeta> = _RAW_CHARACTERS;

/**
 * Personagens com medidor de afinidade ativo na interface (HUD, créditos e balanço).
 */
export const AFFINITY_ROSTER_IDS: CharacterId[] = ['personagem_a', 'personagem_b'];

/**
 * Personagens exibidos no Estúdio de Sprites (galeria de validação de assets).
 */
export const GALLERY_CHARACTER_IDS: CharacterId[] = [...AFFINITY_ROSTER_IDS];

/**
 * Apelidos extras aceitos nos JSONs (além do id, nome e nickname, que já são
 * reconhecidos automaticamente). Ex.: { 'dr. panda': 'personagem_a' }
 */
export const EXTRA_CHARACTER_ALIASES: Record<string, CharacterId> = {
  narrador: 'narrator',
  voce: 'protagonist',
  'você': 'protagonist',
};
