import React, { useState, useEffect } from 'react';
import { CharacterSpriteConfig } from '../../types/character';
import { getSpritePath, getFallbackSpritePath } from '../../utils/assetHelper';
import { CharacterAvatarSvg } from '../placeholders/CharacterAvatarSvg';

interface CharacterSpriteProps {
  config?: CharacterSpriteConfig;
}

export const CharacterSprite: React.FC<CharacterSpriteProps> = ({ config }) => {
  const [imageError, setImageError] = useState(false);
  const [loadedUrl, setLoadedUrl] = useState<string | null>(() =>
    config ? getSpritePath(config.characterId, config.expression) : null
  );

  useEffect(() => {
    if (!config) return;

    let cancelled = false;
    setImageError(false);
    const spriteUrl = getSpritePath(config.characterId, config.expression);
    const fallbackUrl = getFallbackSpritePath(config.characterId, config.expression);

    const tryLoad = (url: string, nextFallback: string | null) => {
      const img = new Image();
      img.src = url;
      img.onload = () => {
        if (cancelled) return;
        setLoadedUrl(url);
        setImageError(false);
      };
      img.onerror = () => {
        if (cancelled) return;
        if (nextFallback) {
          tryLoad(nextFallback, null);
        } else {
          setImageError(true);
          setLoadedUrl(null);
        }
      };
    };

    tryLoad(spriteUrl, fallbackUrl);

    return () => {
      cancelled = true;
    };
  }, [config?.characterId, config?.expression]);

  if (!config) return null;

  const positionClasses = {
    left: 'left-12 lg:left-24 justify-start',
    center: 'left-1/2 -translate-x-1/2 justify-center',
    right: 'right-12 lg:right-24 justify-end',
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
      className={`absolute bottom-0 z-10 pointer-events-none flex items-end h-[82%] max-h-[780px] transition-all duration-500 ease-out ${positionClasses}`}
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
