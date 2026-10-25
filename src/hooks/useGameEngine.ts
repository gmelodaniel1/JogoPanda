import { useState, useEffect, useCallback, useMemo } from 'react';
import { CharacterId } from '../types/character';
import { DialogueChoice, DialogueNode, DialogueScript } from '../types/dialogue';
import {
  AffinityToastNotification,
  DialogueHistoryItem,
  GameEngineControls,
  GameState,
  TextSpeed,
} from '../types/game';
import { CHARACTERS_METADATA } from '../constants/characters';
import { soundEngine } from '../utils/soundEngine';
import { saveManager } from '../utils/saveManager';
import { GameSaveSlot } from '../types/save';
import { DEFAULT_BACKGROUND } from '../constants/backgrounds';

const INITIAL_AFFINITIES: Record<CharacterId, number> = Object.keys(CHARACTERS_METADATA).reduce(
  (acc, key) => {
    acc[key as CharacterId] = 0;
    return acc;
  },
  {} as Record<CharacterId, number>
);

const clampLom = (val: number) => Math.max(-100, Math.min(100, val));

function buildHistoryEntry(node: DialogueNode, chosenOption?: string): DialogueHistoryItem {
  const speakerMeta = CHARACTERS_METADATA[node.speaker];
  const speakerName = node.speakerDisplayName || (speakerMeta ? speakerMeta.name : node.speaker);

  return {
    id: `${node.id}-${Date.now()}`,
    nodeId: node.id,
    speaker: node.speaker,
    speakerName,
    text: node.text,
    chosenOption,
    timestamp: Date.now(),
  };
}

export function useGameEngine(script: DialogueScript, episodeNumProp?: number): GameEngineControls {
  const episodeNum = episodeNumProp || parseInt(script.id.replace('episode-', ''), 10) || 1;

  const [state, setState] = useState<GameState>(() => ({
    scriptId: script.id,
    currentNodeId: script.initialNodeId,
    affinities: { ...INITIAL_AFFINITIES },
    episodeAffinityDeltas: {},
    history: [],
    isTyping: true,
    autoPlay: false,
    textSpeed: saveManager.loadPreferences().textSpeed,
    isBacklogOpen: false,
    isEpisodeCompleted: false,
    activeToast: null,
  }));

  // Se o episódio mudou, resolve imediatamente o nó inicial do novo episódio sem flash de erro
  const effectiveNodeId = state.scriptId === script.id ? state.currentNodeId : script.initialNodeId;

  const currentNode: DialogueNode = useMemo(() => {
    return (
      script.nodes[effectiveNodeId] || {
        id: 'missing-node',
        speaker: 'narrator',
        text: `[Erro: Nó de diálogo "${effectiveNodeId}" não encontrado no roteiro.]`,
        background: DEFAULT_BACKGROUND,
        isEnding: true,
      }
    );
  }, [script, effectiveNodeId]);

  const hasChoices = Boolean(currentNode.choices && currentNode.choices.length > 0);
  const isEnding = Boolean(currentNode.isEnding);

  // Sincroniza estado ao trocar de episódio (preserva afinidades e velocidade de texto)
  useEffect(() => {
    setState((prev) => {
      if (prev.scriptId === script.id) return prev;
      return {
        ...prev,
        scriptId: script.id,
        currentNodeId: script.initialNodeId,
        episodeAffinityDeltas: {},
        history: [],
        isTyping: true,
        autoPlay: false,
        isBacklogOpen: false,
        isEpisodeCompleted: false,
        activeToast: null,
      };
    });
  }, [script.id, script.initialNodeId]);

  // Executa SFX e sincroniza trilha BGM ao entrar em um nó
  useEffect(() => {
    if (currentNode.sfx) {
      soundEngine.playSfx(currentNode.sfx);
    }
    if (currentNode.bgm) {
      soundEngine.playBgm(currentNode.bgm);
    }
  }, [script.id, currentNode.id, currentNode.sfx, currentNode.bgm]);

  // Limpa toast de afinidade após 2.8s
  useEffect(() => {
    if (!state.activeToast) return;
    const timer = setTimeout(() => {
      setState((prev) => ({ ...prev, activeToast: null }));
    }, 2800);
    return () => clearTimeout(timer);
  }, [state.activeToast]);

  const setIsTyping = useCallback((typing: boolean) => {
    setState((prev) => (prev.isTyping === typing ? prev : { ...prev, isTyping: typing }));
  }, []);

  const finishTypingEarly = useCallback(() => {
    setState((prev) => (prev.isTyping ? { ...prev, isTyping: false } : prev));
  }, []);

  const openEpisodeCompletion = useCallback(() => {
    soundEngine.playVictoryFanfare();
    setState((prev) => ({ ...prev, isEpisodeCompleted: true, autoPlay: false }));
  }, []);

  const closeEpisodeCompletion = useCallback(() => {
    soundEngine.playClick();
    setState((prev) => ({ ...prev, isEpisodeCompleted: false }));
  }, []);

  const transitionToNode = useCallback(
    (targetNodeId: string, chosenOptionText?: string) => {
      soundEngine.playClick();
      const historyEntry = buildHistoryEntry(currentNode, chosenOptionText);

      setState((prev) => ({
        ...prev,
        currentNodeId: targetNodeId,
        isTyping: true,
        history: [...prev.history, historyEntry],
      }));
    },
    [currentNode]
  );

  const advanceDialogue = useCallback(() => {
    if (state.isTyping) {
      finishTypingEarly();
      return;
    }
    if (hasChoices) {
      return;
    }
    if (isEnding) {
      openEpisodeCompletion();
      return;
    }
    if (currentNode.nextNodeId) {
      transitionToNode(currentNode.nextNodeId);
    }
  }, [state.isTyping, hasChoices, isEnding, currentNode.nextNodeId, finishTypingEarly, transitionToNode, openEpisodeCompletion]);

  const selectChoice = useCallback(
    (choice: DialogueChoice) => {
      const nonZeroChanges = (choice.affinityChanges || []).filter((c) => c.delta !== 0);
      let toastNotification: AffinityToastNotification | null = null;
      const newAffinities = { ...state.affinities };
      const newEpisodeDeltas = { ...state.episodeAffinityDeltas };

      if (nonZeroChanges.length > 0) {
        let netDelta = 0;
        nonZeroChanges.forEach((change) => {
          const currentVal = newAffinities[change.characterId] || 0;
          newAffinities[change.characterId] = clampLom(currentVal + change.delta);
          newEpisodeDeltas[change.characterId] = (newEpisodeDeltas[change.characterId] || 0) + change.delta;
          netDelta += change.delta;
        });

        if (netDelta >= 0) {
          soundEngine.playLomUp();
        } else {
          soundEngine.playLomDown();
        }

        toastNotification = {
          id: `${currentNode.id}-${Date.now()}`,
          changes: nonZeroChanges,
          message: choice.toastFeedback,
        };
      } else {
        soundEngine.playClick();
      }

      const historyEntry = buildHistoryEntry(currentNode, choice.text);

      setState((prev) => ({
        ...prev,
        affinities: newAffinities,
        episodeAffinityDeltas: newEpisodeDeltas,
        currentNodeId: choice.nextNodeId,
        isTyping: true,
        activeToast: toastNotification,
        history: [...prev.history, historyEntry],
      }));
    },
    [state.affinities, state.episodeAffinityDeltas, currentNode]
  );

  // Auto-play timer
  useEffect(() => {
    if (!state.autoPlay || state.isTyping || hasChoices || state.isEpisodeCompleted) return;

    const readingDelay = Math.min(4000, Math.max(1600, currentNode.text.length * 40));
    const timer = setTimeout(() => {
      if (isEnding) {
        openEpisodeCompletion();
      } else if (currentNode.nextNodeId) {
        transitionToNode(currentNode.nextNodeId);
      }
    }, readingDelay);

    return () => clearTimeout(timer);
  }, [state.autoPlay, state.isTyping, hasChoices, isEnding, state.isEpisodeCompleted, currentNode, transitionToNode, openEpisodeCompletion]);

  // Auto-save silencioso gravado no LocalStorage a cada transição de diálogo e escolha
  useEffect(() => {
    if (currentNode.id === 'missing-node') return;

    saveManager.saveToSlot('autosave', {
      episodeNum,
      scriptId: script.id,
      currentNodeId: currentNode.id,
      speaker: currentNode.speaker,
      speakerDisplayName: currentNode.speakerDisplayName || currentNode.speaker,
      previewText: currentNode.text,
      background: currentNode.background,
      affinities: state.affinities,
      episodeAffinityDeltas: state.episodeAffinityDeltas,
      history: state.history,
      textSpeed: state.textSpeed,
    });
  }, [
    episodeNum,
    script.id,
    currentNode.id,
    currentNode.speaker,
    currentNode.speakerDisplayName,
    currentNode.text,
    currentNode.background,
    state.affinities,
    state.episodeAffinityDeltas,
    state.history,
    state.textSpeed,
  ]);

  const toggleAutoPlay = useCallback(() => {
    soundEngine.playClick();
    setState((prev) => ({ ...prev, autoPlay: !prev.autoPlay }));
  }, []);

  const setTextSpeed = useCallback((speed: TextSpeed) => {
    saveManager.savePreferences({ textSpeed: speed });
    setState((prev) => ({ ...prev, textSpeed: speed }));
  }, []);

  const toggleBacklog = useCallback(() => {
    soundEngine.playClick();
    setState((prev) => ({ ...prev, isBacklogOpen: !prev.isBacklogOpen }));
  }, []);

  const closeBacklog = useCallback(() => {
    soundEngine.playClick();
    setState((prev) => ({ ...prev, isBacklogOpen: false }));
  }, []);

  const loadSaveState = useCallback((save: GameSaveSlot) => {
    soundEngine.playClick();
    setState({
      scriptId: save.scriptId,
      currentNodeId: save.currentNodeId,
      affinities: { ...save.affinities },
      episodeAffinityDeltas: { ...(save.episodeAffinityDeltas || {}) },
      history: [...save.history],
      isTyping: true,
      autoPlay: false,
      textSpeed: save.textSpeed,
      isBacklogOpen: false,
      isEpisodeCompleted: false,
      activeToast: null,
    });
  }, []);

  const resetGame = useCallback(() => {
    soundEngine.playClick();
    setState((prev) => ({
      scriptId: script.id,
      currentNodeId: script.initialNodeId,
      affinities: { ...INITIAL_AFFINITIES },
      episodeAffinityDeltas: {},
      history: [],
      isTyping: true,
      autoPlay: false,
      textSpeed: prev.textSpeed,
      isBacklogOpen: false,
      isEpisodeCompleted: false,
      activeToast: null,
    }));
  }, [script.id, script.initialNodeId]);

  return {
    currentNode,
    affinities: state.affinities,
    episodeAffinityDeltas: state.episodeAffinityDeltas,
    history: state.history,
    isTyping: state.isTyping,
    autoPlay: state.autoPlay,
    textSpeed: state.textSpeed,
    isBacklogOpen: state.isBacklogOpen,
    isEpisodeCompleted: state.isEpisodeCompleted,
    activeToast: state.activeToast,
    hasChoices,
    isEnding,
    advanceDialogue,
    selectChoice,
    finishTypingEarly,
    setIsTyping,
    openEpisodeCompletion,
    closeEpisodeCompletion,
    loadSaveState,
    toggleAutoPlay,
    setTextSpeed,
    toggleBacklog,
    closeBacklog,
    resetGame,
  };
}
