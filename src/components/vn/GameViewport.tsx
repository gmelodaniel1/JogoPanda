import React from 'react';
import { GameEngineControls } from '../../types/game';
import { BackgroundView } from './BackgroundView';
import { CharacterSprite } from './CharacterSprite';
import { DialogueBox } from './DialogueBox';
import { ChoiceMenu } from './ChoiceMenu';
import { LoveOMeter } from './LoveOMeter';
import { ControlToolbar } from './ControlToolbar';
import { AffinityNotification } from './AffinityNotification';
import { BacklogModal } from './BacklogModal';
import { EpisodeCompletionModal } from './EpisodeCompletionModal';
import { SaveLoadModal, SaveLoadMode } from './SaveLoadModal';
import { saveManager } from '../../utils/saveManager';
import { GameSaveSlot, SaveSlotId } from '../../types/save';
import { GAME_CONFIG } from '../../config/game.config';

interface GameViewportProps {
  engine: GameEngineControls;
  title?: string;
  currentEpisodeNum: number;
  onSelectEpisode?: (epNum: number) => void;
  onReturnToMenu?: () => void;
  onOpenGallery?: () => void;
  onNextEpisode?: () => void;
  onLoadSave?: (save: GameSaveSlot) => void;
  hasNextEpisode?: boolean;
  nextEpisodeNum?: number;
  nextEpisodeTitle?: string;
}

export const GameViewport: React.FC<GameViewportProps> = ({
  engine,
  title,
  currentEpisodeNum,
  onSelectEpisode,
  onReturnToMenu,
  onOpenGallery,
  onNextEpisode,
  onLoadSave,
  hasNextEpisode = false,
  nextEpisodeNum,
  nextEpisodeTitle,
}) => {
  const [isSaveLoadOpen, setIsSaveLoadOpen] = React.useState<boolean>(false);
  const [saveLoadMode, setSaveLoadMode] = React.useState<SaveLoadMode>('save');

  const {
    currentNode,
    affinities,
    episodeAffinityDeltas,
    history,
    isTyping,
    autoPlay,
    textSpeed,
    isBacklogOpen,
    isEpisodeCompleted,
    activeToast,
    hasChoices,
    isEnding,
    advanceDialogue,
    selectChoice,
    finishTypingEarly,
    setIsTyping,
    toggleAutoPlay,
    setTextSpeed,
    toggleBacklog,
    closeBacklog,
    resetGame,
    loadSaveState,
  } = engine;

  const handleSaveToSlot = (slotId: SaveSlotId) => {
    saveManager.saveToSlot(slotId, {
      episodeNum: currentEpisodeNum,
      scriptId: `episode-${currentEpisodeNum}`,
      currentNodeId: currentNode.id,
      speaker: currentNode.speaker,
      speakerDisplayName: currentNode.speakerDisplayName || currentNode.speaker,
      previewText: currentNode.text,
      background: currentNode.background,
      affinities,
      episodeAffinityDeltas,
      history,
      textSpeed,
    });
  };

  const handleLoadFromSlot = (save: GameSaveSlot) => {
    if (onLoadSave) {
      onLoadSave(save);
    } else {
      loadSaveState(save);
    }
  };

  return (
    <div className="relative w-full h-full h-[100dvh] min-h-[100dvh] overflow-hidden bg-black flex items-center justify-center">
      {/* Container 16:9 responsivo da Visual Novel */}
      <div className="relative w-full h-full max-w-[1920px] max-h-[1080px] flex flex-col justify-between overflow-hidden shadow-2xl">
        {/* Camada 1: Cenário de Fundo */}
        <BackgroundView backgroundId={currentNode.background} />

        {/* Barra Superior de HUD */}
        <header className="relative z-30 flex items-center justify-between gap-2 px-2 sm:px-4 md:px-6 py-2 sm:py-3.5 pt-[max(0.5rem,env(safe-area-inset-top))] pl-[max(0.5rem,env(safe-area-inset-left))] pr-[max(0.5rem,env(safe-area-inset-right))] pointer-events-auto">
          {/* Medidor de Afinidade (Opcional, desativado no Panda de Ferro) */}
          {GAME_CONFIG.hasAffinityMeter ? (
            <LoveOMeter
              activeCharacterId={currentNode.sprite?.characterId || currentNode.speaker}
              affinities={affinities}
            />
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-slate-900/85 backdrop-blur-md border border-slate-700/80 text-xs font-bold text-slate-200 shrink-0">
              <span className="text-red-500 font-extrabold text-xs sm:text-sm">🐼</span>
              <span className="hidden sm:inline">{GAME_CONFIG.hudTitlePrefix}</span>
            </div>
          )}

          {/* Título da Cena / Localização */}
          {title && (
            <div className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/75 backdrop-blur-md border border-slate-700/60 text-xs font-semibold text-slate-300">
              <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
              <span>{title}</span>
            </div>
          )}

          {/* Barra de Ferramentas / Controles Rápidos */}
          <ControlToolbar
            autoPlay={autoPlay}
            textSpeed={textSpeed}
            onToggleAutoPlay={toggleAutoPlay}
            onToggleBacklog={toggleBacklog}
            onReset={resetGame}
            onSetTextSpeed={setTextSpeed}
            onToggleGallery={onOpenGallery}
            onOpenSaveLoad={(mode) => {
              setSaveLoadMode(mode);
              setIsSaveLoadOpen(true);
            }}
            currentEpisodeNum={currentEpisodeNum}
            onSelectEpisode={onSelectEpisode}
            onReturnToMenu={onReturnToMenu}
          />
        </header>

        {/* Camada 2: Notificações Flutuantes de Afinidade (+5 / -10) */}
        <AffinityNotification toast={activeToast} />

        {/* Camada 3: Sprites dos Personagens (Ancorados ao fundo do viewport, atrás do diálogo) */}
        <div className="absolute inset-x-0 bottom-0 top-12 sm:top-16 flex items-end justify-center pointer-events-none z-10 overflow-hidden">
          {currentNode.secondarySprite && (
            <CharacterSprite config={currentNode.secondarySprite} />
          )}
          {currentNode.sprite && (
            <CharacterSprite config={currentNode.sprite} />
          )}
        </div>

        {/* Camada 4: Menu de Escolhas Ramificadas (Exibido apenas após a conclusão da digitação da pergunta) */}
        {hasChoices && !isTyping && (
          <ChoiceMenu
            choices={currentNode.choices || []}
            onSelectChoice={selectChoice}
          />
        )}

        {/* Camada 5: Caixa de Diálogo na Base */}
        <DialogueBox
          speaker={currentNode.speaker}
          speakerDisplayName={currentNode.speakerDisplayName}
          text={currentNode.text}
          textSpeed={textSpeed}
          hasChoices={hasChoices}
          isEnding={isEnding}
          onAdvance={advanceDialogue}
          onFinishTyping={finishTypingEarly}
          onSetIsTyping={setIsTyping}
        />

        {/* Camada 6: Modal de Histórico de Diálogos (Backlog) */}
        <BacklogModal
          isOpen={isBacklogOpen}
          history={history}
          onClose={closeBacklog}
        />

        {/* Camada 7: Tela de Conclusão de Episódio e Transição Contínua de Campanha */}
        {isEpisodeCompleted && (
          <EpisodeCompletionModal
            episodeNum={currentEpisodeNum}
            scriptTitle={currentNode.speaker === 'narrator' ? title?.replace(/^.*:\s*/, '') || '' : ''}
            episodeAffinityDeltas={episodeAffinityDeltas}
            totalAffinities={affinities}
            hasNextEpisode={hasNextEpisode}
            nextEpisodeNum={nextEpisodeNum}
            nextEpisodeTitle={nextEpisodeTitle}
            onNextEpisode={() => onNextEpisode && onNextEpisode()}
            onReturnToMenu={() => onReturnToMenu && onReturnToMenu()}
            onReplayEpisode={resetGame}
          />
        )}

        {/* Camada 8: Modal de Salvamento e Carregamento (Save/Load Slots) */}
        <SaveLoadModal
          isOpen={isSaveLoadOpen}
          initialMode={saveLoadMode}
          onClose={() => setIsSaveLoadOpen(false)}
          onSaveToSlot={handleSaveToSlot}
          onLoadFromSlot={handleLoadFromSlot}
          canSave={true}
        />
      </div>
    </div>
  );
};
