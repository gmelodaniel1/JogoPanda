import React, { useState, useEffect } from 'react';
import { CharacterSpriteConfig } from '../../types/character';
import { getSpritePath, getFallbackSpritePath } from '../../utils/assetHelper';
import { assetPreloader } from '../../utils/assetPreloader';
import { CharacterAvatarSvg } from '../placeholders/CharacterAvatarSvg';

interface CharacterSpriteProps {
  config?: CharacterSpriteConfig;
}

export const CharacterSprite: React.FC<CharacterSpriteProps> = ({ config }) => {
  const [imageError, setImageError] = useState(() => {
    if (!config) return false;
    const primary = getSpritePath(config.characterId, config.expression);
    const fallback = getFallbackSpritePath(config.characterId, config.expression);
    return assetPreloader.isFailed(primary) && (!fallback || assetPreloader.isFailed(fallback));
  });

  const [loadedUrl, setLoadedUrl] = useState<string | null>(() => {
    if (!config) return null;
    const primary = getSpritePath(config.characterId, config.expression);
    if (assetPreloader.isLoaded(primary)) return primary;
    const fallback = getFallbackSpritePath(config.characterId, config.expression);
    if (fallback && assetPreloader.isLoaded(fallback)) return fallback;
    return null;
  });

  useEffect(() => {
    if (!config) return;

    let cancelled = false;
    const spriteUrl = getSpritePath(config.characterId, config.expression);
    const fallbackUrl = getFallbackSpritePath(config.characterId, config.expression);

    // Se já está carregado pelo assetPreloader, exibe imediatamente (0ms)
    if (assetPreloader.isLoaded(spriteUrl)) {
      setLoadedUrl(spriteUrl);
      setImageError(false);
      return;
    }
    if (fallbackUrl && assetPreloader.isLoaded(fallbackUrl)) {
      setLoadedUrl(fallbackUrl);
      setImageError(false);
      return;
    }

    // Se já sabemos que ambos falharam, ativa fallback SVG imediatamente sem aguardar timeout
    if (assetPreloader.isFailed(spriteUrl) && (!fallbackUrl || assetPreloader.isFailed(fallbackUrl))) {
      setImageError(true);
      setLoadedUrl(null);
      return;
    }

    setImageError(false);

    const tryLoad = (url: string, nextFallback: string | null) => {
      if (assetPreloader.isFailed(url)) {
        if (nextFallback) {
          tryLoad(nextFallback, null);
        } else {
          setImageError(true);
          setLoadedUrl(null);
        }
        return;
      }

      assetPreloader.preloadImage(url).then((success) => {
        if (cancelled) return;
        if (success) {
          setLoadedUrl(url);
          setImageError(false);
        } else if (nextFallback) {
          tryLoad(nextFallback, null);
        } else {
          setImageError(true);
          setLoadedUrl(null);
        }
      });
    };

    tryLoad(spriteUrl, fallbackUrl);

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
