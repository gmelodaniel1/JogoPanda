import React, { useState, useEffect, useRef } from 'react';
import { CharacterSpriteConfig } from '../../types/character';
import { CHARACTERS_METADATA } from '../../constants/characters';
import { getSpriteCandidates } from '../../utils/assetHelper';
import { assetPreloader } from '../../utils/assetPreloader';
import { CharacterAvatarSvg } from '../placeholders/CharacterAvatarSvg';

interface CharacterSpriteProps {
  config?: CharacterSpriteConfig;
  isActiveSpeaker?: boolean;
  isDimmed?: boolean;
}

export const CharacterSprite: React.FC<CharacterSpriteProps> = ({
  config,
  isActiveSpeaker = false,
  isDimmed = false,
}) => {
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

  const [prevUrl, setPrevUrl] = useState<string | null>(null);
  const prevCharIdRef = useRef<string | undefined>(config?.characterId);

  useEffect(() => {
    prevCharIdRef.current = config?.characterId;
  }, [config?.characterId]);

  useEffect(() => {
    if (!config) return;

    let cancelled = false;
    let fadeTimer: ReturnType<typeof setTimeout> | null = null;
    const candidates = getSpriteCandidates(config.characterId, config.expression);

    const applyUrl = (nextUrl: string) => {
      setImageError(false);
      if (nextUrl !== loadedUrl) {
        if (loadedUrl && config.characterId === prevCharIdRef.current) {
          setPrevUrl(loadedUrl);
          fadeTimer = setTimeout(() => {
            if (!cancelled) setPrevUrl(null);
          }, 350);
        } else {
          setPrevUrl(null);
        }
        setLoadedUrl(nextUrl);
      }
    };

    // 1. Se algum candidato já está decodificado em memória pelo preloader, exibe imediatamente (0ms)
    for (const url of candidates) {
      if (assetPreloader.isLoaded(url)) {
        applyUrl(url);
        return () => {
          cancelled = true;
          if (fadeTimer) clearTimeout(fadeTimer);
        };
      }
    }

    // 2. Se todos os candidatos já falharam, ativa fallback SVG imediatamente sem aguardar timeout
    if (candidates.every((url) => assetPreloader.isFailed(url))) {
      setImageError(true);
      setLoadedUrl(null);
      setPrevUrl(null);
      return;
    }

    setImageError(false);

    // 3. Tenta carregar os candidatos em sequência: webp -> png -> fallbacks
    const tryCandidates = async (index: number) => {
      if (index >= candidates.length) {
        if (!cancelled) {
          setImageError(true);
          setLoadedUrl(null);
          setPrevUrl(null);
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
        applyUrl(url);
      } else {
        tryCandidates(index + 1);
      }
    };

    tryCandidates(0);

    return () => {
      cancelled = true;
      if (fadeTimer) clearTimeout(fadeTimer);
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

  const charMeta = config ? CHARACTERS_METADATA[config.characterId] : undefined;
  const themeColor = charMeta?.themeColor || '#ec4899';

  const transformParts = [
    config.flipHorizontal ? 'scaleX(-1)' : '',
    config.scale ? `scale(${config.scale})` : '',
  ].filter(Boolean);

  const focusClasses = isDimmed
    ? 'brightness-[0.70] contrast-[0.92] scale-[0.96] opacity-90 z-10'
    : isActiveSpeaker
    ? 'brightness-105 contrast-105 scale-100 opacity-100 z-20'
    : 'brightness-100 contrast-100 scale-100 opacity-100 z-10';

  const activeShadowStyle: React.CSSProperties = {
    filter: isActiveSpeaker
      ? `drop-shadow(0 0 22px ${themeColor}66) drop-shadow(0 15px 30px rgba(0,0,0,0.7))`
      : 'drop-shadow(0 15px 30px rgba(0,0,0,0.6))',
    transition: 'filter 300ms ease-out',
  };

  const portraitMaskStyle: React.CSSProperties = {
    WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 72%, transparent 98%)',
    maskImage: 'linear-gradient(to bottom, black 0%, black 72%, transparent 98%)',
  };

  return (
    <div
      key={config.characterId}
      className={`absolute bottom-0 pointer-events-none flex items-end h-[70%] sm:h-[80%] md:h-[82%] max-h-[780px] transition-all duration-300 ease-out will-change-transform transform-gpu ${focusClasses} ${positionClasses}`}
    >
      {/* Camada de animação de entrada ou reação (shake, bob) com aceleração de GPU */}
      <div
        key={`${config.characterId}-${config.animation || 'slide-up-fade'}`}
        className={`relative h-full flex items-end will-change-transform transform-gpu ${animationClass}`}
      >
        {/* Camada de escala e flip horizontal com baseline rígida na base (bottom center) */}
        <div
          className="relative h-full flex items-end justify-center"
          style={{
            transform: transformParts.length > 0 ? transformParts.join(' ') : undefined,
            transformOrigin: 'bottom center',
          }}
        >
          {!imageError && (loadedUrl || prevUrl) ? (
            <div
              className="relative h-full flex items-end justify-center rounded-2xl sm:rounded-3xl"
              style={{ ...activeShadowStyle, ...portraitMaskStyle }}
            >
              {/* Expressão anterior (mantida no fundo durante o fade para eliminar jitter de cabeça) */}
              {prevUrl && (
                <img
                  src={prevUrl}
                  alt={`${config.characterId} - anterior`}
                  className="h-full w-auto object-contain object-bottom select-none pointer-events-none absolute inset-0 z-0 opacity-80 rounded-2xl sm:rounded-3xl"
                />
              )}

              {/* Expressão atual (fade-in suave sobreposta sem frame em branco) */}
              {loadedUrl && (
                <img
                  key={loadedUrl}
                  src={loadedUrl}
                  alt={`${config.characterId} - ${config.expression}`}
                  className="h-full w-auto object-contain object-bottom select-none pointer-events-none relative z-10 transition-opacity duration-300 animate-fade-in rounded-2xl sm:rounded-3xl"
                />
              )}
            </div>
          ) : (
            <div style={activeShadowStyle}>
              <CharacterAvatarSvg
                characterId={config.characterId}
                expression={config.expression}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
