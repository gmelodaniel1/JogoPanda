import { CharacterId } from './character';
import { AffinityChange, DialogueChoice, DialogueNode } from './dialogue';
import { GameSaveSlot } from './save';

export type TextSpeed = 25 | 12 | 3;

export interface DialogueHistoryItem {
  id: string;
  nodeId: string;
  speaker: CharacterId;
  speakerName: string;
  text: string;
  chosenOption?: string;
  timestamp: number;
}

export interface AffinityToastNotification {
  id: string;
  changes: AffinityChange[];
  message?: string;
}

export interface GameState {
  scriptId: string;
  currentNodeId: string;
  affinities: Record<CharacterId, number>;
  episodeAffinityDeltas: Partial<Record<CharacterId, number>>;
  history: DialogueHistoryItem[];
  isTyping: boolean;
  autoPlay: boolean;
  textSpeed: TextSpeed;
  isBacklogOpen: boolean;
  isEpisodeCompleted: boolean;
  activeToast: AffinityToastNotification | null;
}

export interface GameEngineControls {
  // Estado derivado
  currentNode: DialogueNode;
  affinities: Record<CharacterId, number>;
  episodeAffinityDeltas: Partial<Record<CharacterId, number>>;
  history: DialogueHistoryItem[];
  isTyping: boolean;
  autoPlay: boolean;
  textSpeed: TextSpeed;
  isBacklogOpen: boolean;
  isEpisodeCompleted: boolean;
  activeToast: AffinityToastNotification | null;
  hasChoices: boolean;
  isEnding: boolean;

  // Ações principais
  advanceDialogue: () => void;
  selectChoice: (choice: DialogueChoice) => void;
  finishTypingEarly: () => void;
  setIsTyping: (typing: boolean) => void;
  loadSaveState: (save: GameSaveSlot) => void;

  // Controles de conclusão de episódio
  openEpisodeCompletion: () => void;
  closeEpisodeCompletion: () => void;

  // Controles auxiliares
  toggleAutoPlay: () => void;
  setTextSpeed: (speed: TextSpeed) => void;
  toggleBacklog: () => void;
  closeBacklog: () => void;
  resetGame: () => void;
}
