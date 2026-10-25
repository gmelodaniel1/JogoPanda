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

export function getSpritePath(characterId: string, expression: string): string {
  return `./assets/sprites/${characterId}/${expression}.png?v=${ASSET_VERSION}`;
}

export function getFallbackSpritePath(characterId: string, expression: string): string | null {
  const fallbackExpr = EXPRESSION_FALLBACKS[expression];
  if (fallbackExpr && fallbackExpr !== expression) {
    return getSpritePath(characterId, fallbackExpr);
  }
  if (expression !== 'neutral') {
    return getSpritePath(characterId, 'neutral');
  }
  return null;
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
