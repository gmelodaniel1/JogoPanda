import { CharacterId, CharacterSpriteConfig } from './character';
import type { BackgroundId } from '../constants/backgrounds';

/**
 * Identificadores canônicos dos cenários (definidos em `src/constants/backgrounds.ts`).
 */
export type { BackgroundId };

/**
 * Efeitos sonoros suportados pelo motor de áudio procedural.
 * - impact: batida grave/pulso (choque, impacto, susto)
 * - alert:  bipe agudo duplo (alarme, notificação)
 */
export type SfxType = 'click' | 'impact' | 'alert' | 'footsteps' | 'door' | 'lom-up' | 'lom-down' | 'type';

/**
 * Trilhas de música de fundo (BGM) procedurais.
 */
export type BgmTrack = 'casual' | 'tension' | 'energetic' | 'romance' | 'off';

/**
 * Alteração de afinidade.
 * Varia de -100 (hostilidade) a +100 (admiração/amor).
 */
export interface AffinityChange {
  characterId: CharacterId;
  delta: number;           // Ex: +5, -10 (sempre != 0)
  feedbackReason?: string; // Ex: "Ficou feliz com sua sinceridade"
}

/**
 * Opção de escolha em um nó ramificado.
 */
export interface DialogueChoice {
  id: string;
  text: string;
  nextNodeId: string;
  /**
   * Alterações de LOM aplicadas ao escolher esta opção.
   * Pode afetar múltiplos personagens simultaneamente (ex: elogiar um e irritar outro).
   */
  affinityChanges?: AffinityChange[];
  /**
   * Mensagem temporária na tela (Toast) ao escolher.
   */
  toastFeedback?: string;
}

/**
 * Nó do roteiro de diálogo da Visual Novel.
 */
export interface DialogueNode {
  id: string;
  /**
   * Quem está falando no momento.
   * 'narrator' oculta a caixa de nome ou exibe estilo narrativo.
   * 'protagonist' exibe os pensamentos ou fala do jogador.
   */
  speaker: CharacterId;
  /**
   * Nome alternativo a ser exibido (ex: "Voz Misteriosa", "???").
   */
  speakerDisplayName?: string;
  /**
   * Texto falado, renderizado com efeito de máquina de escrever (typewriter).
   */
  text: string;
  /**
   * Configuração do sprite do personagem principal em cena (expressão, posição e animação).
   */
  sprite?: CharacterSpriteConfig;
  /**
   * Sprite secundário opcional para cenas com dois personagens conversando.
   */
  secondarySprite?: CharacterSpriteConfig;
  /**
   * Identificador do cenário de fundo.
   */
  background: BackgroundId;
  /**
   * Efeito sonoro opcional a ser disparado ao entrar no nó.
   */
  sfx?: SfxType;
  /**
   * Trilha musical de fundo (BGM) opcional associada a este momento.
   */
  bgm?: BgmTrack;
  /**
   * Lista de opções de resposta do jogador. Se não houver escolhas,
   * o nó avança ao clicar na tela para `nextNodeId`.
   */
  choices?: DialogueChoice[];
  /**
   * ID do próximo nó quando não houver escolhas ramificadas.
   */
  nextNodeId?: string;
  /**
   * Indica se este nó é um desfecho/fim da cena ou capítulo.
   */
  isEnding?: boolean;
}

/**
 * Roteiro completo indexado por ID de nó.
 */
export interface DialogueScript {
  id: string;
  title: string;
  description: string;
  initialNodeId: string;
  nodes: Record<string, DialogueNode>;
}
