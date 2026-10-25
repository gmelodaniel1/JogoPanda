import { BackgroundId, BACKGROUNDS, DEFAULT_BACKGROUND } from '../constants/backgrounds';

/**
 * Auxiliar para resolução de caminhos de assets (sprites e cenários).
 */

/**
 * Expressões alternativas tentadas quando o PNG pedido não existe.
 * Ex.: se o roteiro pedir "furious" e só existir "angry", use { furious: 'angry' }.
 * Se nada for encontrado, o motor tenta "neutral" e, por fim, o placeholder SVG.
 */
const EXPRESSION_FALLBACKS: Record<string, string> = {
  // furious: 'angry',
};

/** Incremente para forçar o navegador a recarregar sprites após substituí-los. */
const ASSET_VERSION = 1;

/**
 * Retorna o caminho do sprite no formato WebP moderno (alta compressão com canal alfa).
 */
export function getSpriteWebpPath(characterId: string, expression: string): string {
  return `./assets/sprites/${characterId}/${expression}.webp?v=${ASSET_VERSION}`;
}

/**
 * Retorna o caminho do sprite no formato PNG tradicional.
 */
export function getSpritePngPath(characterId: string, expression: string): string {
  return `./assets/sprites/${characterId}/${expression}.png?v=${ASSET_VERSION}`;
}

/**
 * Retorna o caminho primário do sprite (WebP preferencial por padrão).
 */
export function getSpritePath(characterId: string, expression: string): string {
  return getSpriteWebpPath(characterId, expression);
}

/**
 * Retorna todos os caminhos candidatos para um sprite em ordem de preferência:
 * 1. Expressão solicitada em .webp (mais leve)
 * 2. Expressão solicitada em .png (legado/fallback)
 * 3. Expressão alternativa ou 'neutral' em .webp
 * 4. Expressão alternativa ou 'neutral' em .png
 */
export function getSpriteCandidates(characterId: string, expression: string): string[] {
  const candidates: string[] = [
    getSpriteWebpPath(characterId, expression),
    getSpritePngPath(characterId, expression),
  ];

  const fallbackExpr = EXPRESSION_FALLBACKS[expression];
  if (fallbackExpr && fallbackExpr !== expression) {
    candidates.push(
      getSpriteWebpPath(characterId, fallbackExpr),
      getSpritePngPath(characterId, fallbackExpr)
    );
  } else if (expression !== 'neutral' && !expression.endsWith('_neutro')) {
    const charNeutral = `${characterId}_neutro`;
    candidates.push(
      getSpriteWebpPath(characterId, charNeutral),
      getSpritePngPath(characterId, charNeutral),
      getSpriteWebpPath(characterId, 'neutral'),
      getSpritePngPath(characterId, 'neutral')
    );
  }

  // Remove duplicatas preservando a ordem
  return Array.from(new Set(candidates));
}

/**
 * Retorna o fallback secundário direto em PNG para compatibilidade com código existente.
 */
export function getFallbackSpritePath(characterId: string, expression: string): string | null {
  return getSpritePngPath(characterId, expression);
}

/**
 * Mapa de aliases -> id canônico, gerado a partir de `BACKGROUNDS`.
 */
export const BACKGROUND_ALIASES: Record<string, BackgroundId> = Object.entries(BACKGROUNDS).reduce(
  (acc, [id, def]) => {
    acc[id] = id as BackgroundId;
    for (const alias of def.aliases) acc[alias] = id as BackgroundId;
    return acc;
  },
  {} as Record<string, BackgroundId>
);

export function normalizeBackgroundId(backgroundId: string | null | undefined): BackgroundId {
  if (!backgroundId) return DEFAULT_BACKGROUND;
  return BACKGROUND_ALIASES[backgroundId] || DEFAULT_BACKGROUND;
}

export function getBackgroundLabel(backgroundId: string): string {
  return BACKGROUNDS[normalizeBackgroundId(backgroundId)].label;
}

export function getBackgroundPath(backgroundId: string): string {
  const resolved = normalizeBackgroundId(backgroundId);
  return `./assets/backgrounds/${resolved}.webp`;
}

export function getBackgroundFallbackPath(backgroundId: string): string {
  const resolved = normalizeBackgroundId(backgroundId);
  return `./assets/backgrounds/${resolved}.jpg`;
}

/**
 * Retorna todos os caminhos candidatos para um cenário em ordem: .webp -> .jpg -> .png
 */
export function getBackgroundCandidates(backgroundId: string): string[] {
  const resolved = normalizeBackgroundId(backgroundId);
  return [
    `./assets/backgrounds/${resolved}.webp`,
    `./assets/backgrounds/${resolved}.jpg`,
    `./assets/backgrounds/${resolved}.png`,
  ];
}
