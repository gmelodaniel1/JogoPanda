import React, { useState, useEffect } from 'react';
import { CharacterSpriteConfig } from '../../types/character';
import { getSpriteCandidates } from '../../utils/assetHelper';
import { assetPreloader } from '../../utils/assetPreloader';
import { CharacterAvatarSvg } from '../placeholders/CharacterAvatarSvg';

interface CharacterSpriteProps {
  config?: CharacterSpriteConfig;
}

export const CharacterSprite: React.FC<CharacterSpriteProps> = ({ config }) => {
  const [imageError, setImageError] = useState(() => {
    if (!config) return false;
    const candidates = getSpriteCandidates(config.characterId, config.expression);
    return candidates.every((url) => assetPreloader.isFailed(url));
  });

  const [loadedUrl, setLoadedUrl] = useState<string | null>(() => {
    if (!config) return null;
    const candidates = getSpriteCandidates(config.characterId, config.expression);
    for (const url of candidates) {
      if (assetPreloader.isLoaded(url)) return url;
    }
    return null;
  });

  useEffect(() => {
    if (!config) return;

    let cancelled = false;
    const candidates = getSpriteCandidates(config.characterId, config.expression);

    // 1. Se algum candidato já está decodificado em memória pelo preloader, exibe imediatamente (0ms)
    for (const url of candidates) {
      if (assetPreloader.isLoaded(url)) {
        setLoadedUrl(url);
        setImageError(false);
        return;
      }
    }

    // 2. Se todos os candidatos já falharam, ativa fallback SVG imediatamente sem aguardar timeout
    if (candidates.every((url) => assetPreloader.isFailed(url))) {
      setImageError(true);
      setLoadedUrl(null);
      return;
    }

    setImageError(false);

    // 3. Tenta carregar os candidatos em sequência: webp -> png -> fallbacks
    const tryCandidates = async (index: number) => {
      if (index >= candidates.length) {
        if (!cancelled) {
          setImageError(true);
          setLoadedUrl(null);
        }
        return;
      }

      const url = candidates[index];
      if (assetPreloader.isFailed(url)) {
        tryCandidates(index + 1);
        return;
      }

      const success = await assetPreloader.preloadImage(url);
      if (cancelled) return;

      if (success) {
        setLoadedUrl(url);
        setImageError(false);
      } else {
        tryCandidates(index + 1);
      }
    };

    tryCandidates(0);

    return () => {
      cancelled = true;
    };
  }, [config?.characterId, config?.expression]);

  if (!config) return null;

  const positionClasses = {
    left: 'left-2 sm:left-12 lg:left-24 justify-start',
    center: 'left-1/2 -translate-x-1/2 justify-center',
    right: 'right-2 sm:right-12 lg:right-24 justify-end',
  }[config.position || 'center'];

  const animationClass = {
    'slide-up-fade': 'animate-slide-up-fade',
    'fade-in': 'animate-fade-in',
    'sprite-shake': 'animate-sprite-shake',
    'sprite-bob': 'animate-sprite-bob',
    'none': '',
  }[config.animation || 'slide-up-fade'];

  const transformParts = [
    config.flipHorizontal ? 'scaleX(-1)' : '',
    config.scale ? `scale(${config.scale})` : '',
  ].filter(Boolean);

  return (
    <div
      key={config.characterId}
      className={`absolute bottom-0 z-10 pointer-events-none flex items-end h-[70%] sm:h-[80%] md:h-[82%] max-h-[780px] transition-all duration-500 ease-out ${positionClasses}`}
    >
      {/* Camada de animação de entrada ou reação (shake, bob) */}
      <div
        key={`${config.characterId}-${config.animation || 'slide-up-fade'}`}
        className={`relative h-full flex items-end ${animationClass}`}
      >
        {/* Camada de escala e flip horizontal */}
        <div
          className="relative h-full flex items-end"
          style={{
            transform: transformParts.length > 0 ? transformParts.join(' ') : undefined,
            transformOrigin: 'bottom center',
          }}
        >
          {!imageError && loadedUrl ? (
            <img
              key={loadedUrl}
              src={loadedUrl}
              alt={`${config.characterId} - ${config.expression}`}
              className="h-full w-auto object-contain object-bottom drop-shadow-[0_20px_35px_rgba(0,0,0,0.6)] select-none pointer-events-none transition-opacity duration-300 animate-fade-in"
            />
          ) : (
            <CharacterAvatarSvg
              characterId={config.characterId}
              expression={config.expression}
            />
          )}
        </div>
      </div>
    </div>
  );
};
