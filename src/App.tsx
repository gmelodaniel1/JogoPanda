import { useState, useEffect } from 'react';
import { useGameEngine } from './hooks/useGameEngine';
import { ALL_EPISODES, FIRST_EPISODE_NUM } from './data/episodes';
import { GAME_CONFIG } from './config/game.config';
import { GameViewport } from './components/vn/GameViewport';
import { MainMenu } from './components/menu/MainMenu';
import { EpisodeSelectModal } from './components/menu/EpisodeSelectModal';
import { CreditsModal } from './components/menu/CreditsModal';
import { SpriteGallery } from './components/dev/SpriteGallery';
import { SaveLoadModal, SaveLoadMode } from './components/vn/SaveLoadModal';
import { saveManager } from './utils/saveManager';
import { GameSaveSlot } from './types/save';

type Screen = 'menu' | 'game';

export function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('menu');
  const [currentEpisodeNum, setCurrentEpisodeNum] = useState<number>(FIRST_EPISODE_NUM);
  const [completedEpisodes, setCompletedEpisodes] = useState<number[]>(() =>
    saveManager.loadPreferences().completedEpisodes
  );
  const [isEpisodeSelectOpen, setIsEpisodeSelectOpen] = useState<boolean>(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState<boolean>(false);
  const [isCreditsOpen, setIsCreditsOpen] = useState<boolean>(false);
  const [isSaveLoadOpen, setIsSaveLoadOpen] = useState<boolean>(false);
  const [saveLoadMode, setSaveLoadMode] = useState<SaveLoadMode>('load');
  const [latestSave, setLatestSave] = useState<GameSaveSlot | null>(() =>
    saveManager.getLatestSave()
  );

  const currentScript = ALL_EPISODES[currentEpisodeNum] || ALL_EPISODES[FIRST_EPISODE_NUM];
  const engine = useGameEngine(currentScript, currentEpisodeNum);

  // Atualiza o save mais recente ao retornar para a tela de menu
  useEffect(() => {
    if (currentScreen === 'menu') {
      setLatestSave(saveManager.getLatestSave());
    }
  }, [currentScreen]);

  const nextEpisodeNum = currentEpisodeNum + 1;
  const hasNextEpisode = Boolean(ALL_EPISODES[nextEpisodeNum]);
  const nextEpisodeTitle = ALL_EPISODES[nextEpisodeNum]?.title;

  const markEpisodeCompleted = (epNum: number) => {
    setCompletedEpisodes((prev) => {
      if (prev.includes(epNum)) return prev;
      const updated = [...prev, epNum];
      saveManager.savePreferences({ completedEpisodes: updated });
      return updated;
    });
  };

  const handleStartEpisode = (episodeNum: number) => {
    setCurrentEpisodeNum(episodeNum);
    setCurrentScreen('game');
  };

  const handleNextEpisode = () => {
    markEpisodeCompleted(currentEpisodeNum);
    if (hasNextEpisode) {
      setCurrentEpisodeNum(nextEpisodeNum);
    }
  };

  const handleReturnToMenu = () => {
    if (engine.isEnding || engine.isEpisodeCompleted) {
      markEpisodeCompleted(currentEpisodeNum);
    }
    setLatestSave(saveManager.getLatestSave());
    setCurrentScreen('menu');
  };

  const handleLoadSave = (save: GameSaveSlot) => {
    if (save.episodeNum !== currentEpisodeNum) {
      setCurrentEpisodeNum(save.episodeNum);
    }
    engine.loadSaveState(save);
    setIsSaveLoadOpen(false);
    setCurrentScreen('game');
  };

  return (
    <main className="w-full h-full h-[100dvh] min-h-[100dvh] overflow-hidden bg-slate-950 font-sans">
      {/* Tela do Menu Principal */}
      {currentScreen === 'menu' && (
        <MainMenu
          onStartGame={() => setCurrentScreen('game')}
          onOpenEpisodeSelect={() => setIsEpisodeSelectOpen(true)}
          onOpenGallery={() => setIsGalleryOpen(true)}
          onOpenCredits={() => setIsCreditsOpen(true)}
          onOpenSaveLoad={(mode) => {
            setSaveLoadMode(mode);
            setIsSaveLoadOpen(true);
          }}
          onContinueLatestSave={handleLoadSave}
          currentEpisodeNum={currentEpisodeNum}
          completedEpisodes={completedEpisodes}
          latestSave={latestSave}
        />
      )}

      {/* Tela do Jogo (Visual Novel) */}
      {currentScreen === 'game' && (
        <GameViewport
          engine={engine}
          title={`${GAME_CONFIG.hudTitlePrefix} • Ep. ${currentEpisodeNum}: ${currentScript.title}`}
          onSelectEpisode={setCurrentEpisodeNum}
          currentEpisodeNum={currentEpisodeNum}
          onReturnToMenu={handleReturnToMenu}
          onOpenGallery={() => setIsGalleryOpen(true)}
          onNextEpisode={handleNextEpisode}
          onLoadSave={handleLoadSave}
          hasNextEpisode={hasNextEpisode}
          nextEpisodeNum={nextEpisodeNum}
          nextEpisodeTitle={nextEpisodeTitle}
        />
      )}

      {/* Modal de Seleção de Episódios */}
      {isEpisodeSelectOpen && (
        <EpisodeSelectModal
          onClose={() => setIsEpisodeSelectOpen(false)}
          onSelectEpisode={handleStartEpisode}
          currentEpisodeNum={currentEpisodeNum}
          completedEpisodes={completedEpisodes}
        />
      )}

      {/* Modal do Estúdio de Sprites */}
      {isGalleryOpen && (
        <SpriteGallery onClose={() => setIsGalleryOpen(false)} />
      )}

      {/* Modal de Créditos */}
      {isCreditsOpen && (
        <CreditsModal onClose={() => setIsCreditsOpen(false)} />
      )}

      {/* Modal de Salvamento e Carregamento (Save / Load) */}
      {isSaveLoadOpen && (
        <SaveLoadModal
          isOpen={isSaveLoadOpen}
          initialMode={saveLoadMode}
          onClose={() => {
            setIsSaveLoadOpen(false);
            setLatestSave(saveManager.getLatestSave());
          }}
          onLoadFromSlot={handleLoadSave}
          canSave={currentScreen === 'game'}
        />
      )}
    </main>
  );
}

export default App;
