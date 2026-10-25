import { GameSaveSlot, PlayerPreferences, SaveSlotId } from '../types/save';
import { TextSpeed } from '../types/game';
import { GAME_CONFIG } from '../config/game.config';

const STORAGE_PREFIX = GAME_CONFIG.storagePrefix;
const PREFERENCES_KEY = `${STORAGE_PREFIX}preferences`;
const ALL_SLOT_IDS: SaveSlotId[] = ['autosave', 'slot_1', 'slot_2', 'slot_3', 'slot_4'];

const DEFAULT_PREFERENCES: PlayerPreferences = {
  textSpeed: 25,
  isSoundMuted: false,
  completedEpisodes: [],
};

class SaveManager {
  private isStorageAvailable(): boolean {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return false;
      const testKey = '__storage_test__';
      window.localStorage.setItem(testKey, testKey);
      window.localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  private getSlotStorageKey(slotId: SaveSlotId): string {
    return `${STORAGE_PREFIX}save_${slotId}`;
  }

  public saveToSlot(
    slotId: SaveSlotId,
    data: Omit<GameSaveSlot, 'slotId' | 'timestamp'>
  ): GameSaveSlot | null {
    if (!this.isStorageAvailable()) return null;

    try {
      const fullSave: GameSaveSlot = {
        ...data,
        slotId,
        timestamp: Date.now(),
      };

      const key = this.getSlotStorageKey(slotId);
      window.localStorage.setItem(key, JSON.stringify(fullSave));

      // Atualiza o último slot jogado nas preferências
      this.savePreferences({ lastPlayedSlotId: slotId });

      return fullSave;
    } catch (err) {
      console.warn(`[SaveManager] Falha ao salvar no slot "${slotId}":`, err);
      return null;
    }
  }

  public loadSlot(slotId: SaveSlotId): GameSaveSlot | null {
    if (!this.isStorageAvailable()) return null;

    try {
      const key = this.getSlotStorageKey(slotId);
      const raw = window.localStorage.getItem(key);
      if (!raw) return null;

      const parsed: GameSaveSlot = JSON.parse(raw);
      if (!parsed.scriptId || !parsed.currentNodeId) {
        return null;
      }
      return parsed;
    } catch (err) {
      console.warn(`[SaveManager] Falha ao ler slot "${slotId}":`, err);
      return null;
    }
  }

  public deleteSlot(slotId: SaveSlotId): boolean {
    if (!this.isStorageAvailable()) return false;

    try {
      const key = this.getSlotStorageKey(slotId);
      window.localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }

  public getAllSlots(): Record<SaveSlotId, GameSaveSlot | null> {
    const result: Record<SaveSlotId, GameSaveSlot | null> = {
      autosave: null,
      slot_1: null,
      slot_2: null,
      slot_3: null,
      slot_4: null,
    };

    for (const slotId of ALL_SLOT_IDS) {
      result[slotId] = this.loadSlot(slotId);
    }

    return result;
  }

  public getAutoSave(): GameSaveSlot | null {
    return this.loadSlot('autosave');
  }

  /**
   * Retorna o save mais recente entre o auto-save e os slots manuais
   */
  public getLatestSave(): GameSaveSlot | null {
    const all = this.getAllSlots();
    let latest: GameSaveSlot | null = null;

    for (const slotId of ALL_SLOT_IDS) {
      const save = all[slotId];
      if (save) {
        if (!latest || save.timestamp > latest.timestamp) {
          latest = save;
        }
      }
    }

    return latest;
  }

  public loadPreferences(): PlayerPreferences {
    if (!this.isStorageAvailable()) return DEFAULT_PREFERENCES;

    try {
      const raw = window.localStorage.getItem(PREFERENCES_KEY);
      if (!raw) return DEFAULT_PREFERENCES;
      const parsed = JSON.parse(raw);
      return {
        textSpeed: (parsed.textSpeed as TextSpeed) || DEFAULT_PREFERENCES.textSpeed,
        isSoundMuted: Boolean(parsed.isSoundMuted),
        completedEpisodes: Array.isArray(parsed.completedEpisodes)
          ? parsed.completedEpisodes
          : DEFAULT_PREFERENCES.completedEpisodes,
        lastPlayedSlotId: parsed.lastPlayedSlotId,
      };
    } catch {
      return DEFAULT_PREFERENCES;
    }
  }

  public savePreferences(partial: Partial<PlayerPreferences>): PlayerPreferences {
    if (!this.isStorageAvailable()) {
      return { ...DEFAULT_PREFERENCES, ...partial };
    }

    try {
      const current = this.loadPreferences();
      const updated: PlayerPreferences = {
        ...current,
        ...partial,
      };
      window.localStorage.setItem(PREFERENCES_KEY, JSON.stringify(updated));
      return updated;
    } catch (err) {
      console.warn('[SaveManager] Falha ao persistir preferências:', err);
      return { ...DEFAULT_PREFERENCES, ...partial };
    }
  }
}

export const saveManager = new SaveManager();

