import { BackgroundId, BACKGROUNDS, DEFAULT_BACKGROUND } from '../constants/backgrounds';
import { CHARACTERS_METADATA } from '../constants/characters';

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
const ASSET_VERSION = 3;

/** Extensões de imagem suportadas em ordem de prioridade técnica */
export const SUPPORTED_IMAGE_EXTENSIONS = ['webp', 'png', 'jfif', 'jpg', 'jpeg'] as const;

/**
 * Mapeamento de sprite base/único por personagem, extraído de CHARACTERS_METADATA.
 * Permite que cada panda com foto real seja exibido como fallback universal para qualquer pose.
 */
export const CHARACTER_BASE_SPRITES: Record<string, string> = Object.entries(CHARACTERS_METADATA).reduce(
  (acc, [id, meta]) => {
    if (meta.baseSprite) {
      acc[id] = meta.baseSprite;
    }
    return acc;
  },
  {} as Record<string, string>
);

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
 * 1. Expressão solicitada em .webp, .png, .jfif, .jpg, .jpeg
 * 2. Expressão alternativa ou 'neutral' nas mesmas extensões
 * 3. Foto base universal do personagem (ex.: CipriPanda.jfif)
 */
export function getSpriteCandidates(characterId: string, expression: string): string[] {
  const candidates: string[] = [];

  const addExprCandidates = (expr: string) => {
    if (!expr) return;
    if (expr.includes('.')) {
      candidates.push(`./assets/sprites/${characterId}/${expr}?v=${ASSET_VERSION}`);
    } else {
      for (const ext of SUPPORTED_IMAGE_EXTENSIONS) {
        candidates.push(`./assets/sprites/${characterId}/${expr}.${ext}?v=${ASSET_VERSION}`);
      }
    }
  };

  // 1. Expressão pedida
  addExprCandidates(expression);

  // 2. Fallbacks de expressão (se mapeado em EXPRESSION_FALLBACKS)
  const fallbackExpr = EXPRESSION_FALLBACKS[expression];
  if (fallbackExpr && fallbackExpr !== expression) {
    addExprCandidates(fallbackExpr);
  } else if (expression !== 'neutral' && !expression.endsWith('_neutro')) {
    const charNeutral = `${characterId}_neutro`;
    addExprCandidates(charNeutral);
    addExprCandidates('neutral');
  }

  // 3. Fallback universal para o sprite base do personagem (ex: CipriPanda.jfif)
  const baseSprite = CHARACTER_BASE_SPRITES[characterId];
  if (baseSprite) {
    addExprCandidates(baseSprite);
    const stem = baseSprite.replace(/\.[^.]+$/, '');
    if (stem !== baseSprite) {
      addExprCandidates(stem);
    }
  }

  // Remove duplicatas preservando a ordem
  return Array.from(new Set(candidates));
}

/**
 * Retorna o fallback secundário direto para compatibilidade com código existente.
 */
export function getFallbackSpritePath(characterId: string, expression: string): string | null {
  const baseSprite = CHARACTER_BASE_SPRITES[characterId];
  if (baseSprite) {
    return `./assets/sprites/${characterId}/${baseSprite}?v=${ASSET_VERSION}`;
  }
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
  const def = BACKGROUNDS[resolved] as { file?: string } | undefined;
  if (def?.file) {
    return `./assets/backgrounds/${def.file}`;
  }
  return `./assets/backgrounds/${resolved}.webp`;
}

export function getBackgroundFallbackPath(backgroundId: string): string {
  const resolved = normalizeBackgroundId(backgroundId);
  const def = BACKGROUNDS[resolved] as { file?: string } | undefined;
  if (def?.file) {
    return `./assets/backgrounds/${def.file}`;
  }
  return `./assets/backgrounds/${resolved}.jpg`;
}

/**
 * Retorna todos os caminhos candidatos para um cenário em ordem:
 * 1. Arquivo mapeado explicitamente em BACKGROUNDS (se houver)
 * 2. Formatos padrão (.webp, .jpg, .jfif, .png, .jpeg) usando o ID canônico
 */
export function getBackgroundCandidates(backgroundId: string): string[] {
  const resolved = normalizeBackgroundId(backgroundId);
  const def = BACKGROUNDS[resolved] as { file?: string } | undefined;
  const candidates: string[] = [];

  if (def?.file) {
    candidates.push(`./assets/backgrounds/${def.file}`);
  }

  for (const ext of SUPPORTED_IMAGE_EXTENSIONS) {
    candidates.push(`./assets/backgrounds/${resolved}.${ext}`);
  }

  return Array.from(new Set(candidates));
}
