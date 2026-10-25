import { CharacterId } from './character';
import { BackgroundId } from './dialogue';
import { DialogueHistoryItem, TextSpeed } from './game';

export type SaveSlotId = 'autosave' | 'slot_1' | 'slot_2' | 'slot_3' | 'slot_4';

export interface GameSaveSlot {
  slotId: SaveSlotId;
  timestamp: number;
  episodeNum: number;
  scriptId: string;
  currentNodeId: string;
  speaker: string;
  speakerDisplayName: string;
  previewText: string;
  background: BackgroundId;
  affinities: Record<CharacterId, number>;
  episodeAffinityDeltas: Partial<Record<CharacterId, number>>;
  history: DialogueHistoryItem[];
  textSpeed: TextSpeed;
}

export interface PlayerPreferences {
  textSpeed: TextSpeed;
  isSoundMuted: boolean;
  completedEpisodes: number[];
  lastPlayedSlotId?: SaveSlotId;
}

