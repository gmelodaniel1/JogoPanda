/**
 * Tipos e definições de personagens.
 * Os ids válidos são definidos em `src/constants/characters.ts`.
 */
import type { CharacterId } from '../constants/characters';

export type { CharacterId };

export type CharacterPosition = 'left' | 'center' | 'right';

export type SpriteAnimation =
  | 'slide-up-fade'  // Entrada padrão suave
  | 'fade-in'        // Transição sutil
  | 'sprite-shake'   // Expressão de susto, bronca ou choque
  | 'sprite-bob'     // Fala ativa ou riso leve
  | 'none';

export interface CharacterSpriteConfig {
  characterId: CharacterId;
  expression: string;
  position?: CharacterPosition;
  animation?: SpriteAnimation;
  scale?: number;
  flipHorizontal?: boolean;
}

export interface CharacterMeta {
  id: string;
  name: string;
  nickname?: string;
  title: string;
  hasRomanceRoute: boolean; // false para personagens sem rota romântica
  themeColor: string;       // Cor de destaque para o nome e bordas
  badgeColor: string;       // Cor do badge/cargo
  defaultExpression: string;
  knownExpressions: string[];
  baseSprite?: string;      // Arquivo representativo do personagem (ex: CipriPanda.jfif)
}
