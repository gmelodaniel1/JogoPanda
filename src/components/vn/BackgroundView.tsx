import React, { useState, useEffect } from 'react';
import { getBackgroundPath, getBackgroundFallbackPath } from '../../utils/assetHelper';
import { assetPreloader } from '../../utils/assetPreloader';
import { BackgroundSvg } from '../placeholders/BackgroundSvg';

interface BackgroundViewProps {
  backgroundId: string;
}

interface BackgroundLayer {
  url: string;
  id: string;
}

export const BackgroundView: React.FC<BackgroundViewProps> = ({ backgroundId }) => {
  const [currentLayer, setCurrentLayer] = useState<BackgroundLayer>(() => ({
    url: getBackgroundPath(backgroundId),
    id: backgroundId,
  }));
  const [prevLayer, setPrevLayer] = useState<BackgroundLayer | null>(null);
  const [isCrossFading, setIsCrossFading] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(() => {
    const primary = getBackgroundPath(backgroundId);
    const fallback = getBackgroundFallbackPath(backgroundId);
    return assetPreloader.isFailed(primary) && (!fallback || assetPreloader.isFailed(fallback));
  });

  useEffect(() => {
    let cancelled = false;
    const primaryUrl = getBackgroundPath(backgroundId);
    const fallbackUrl = getBackgroundFallbackPath(backgroundId);

    // Se já sabemos que ambos falharam, ativa fallback SVG imediatamente
    if (assetPreloader.isFailed(primaryUrl) && (!fallbackUrl || assetPreloader.isFailed(fallbackUrl))) {
      setImageError(true);
      return;
    }

    const applyLayerChange = (url: string) => {
      setImageError(false);
      if (url !== currentLayer.url) {
        setPrevLayer(currentLayer);
        setCurrentLayer({ url, id: backgroundId });
        setIsCrossFading(true);

        const timer = setTimeout(() => {
          if (!cancelled) {
            setPrevLayer(null);
            setIsCrossFading(false);
          }
        }, 800);

        return () => clearTimeout(timer);
      }
    };

    const tryLoad = (url: string, nextFallback: string | null) => {
      if (assetPreloader.isLoaded(url)) {
        applyLayerChange(url);
        return;
      }

      if (assetPreloader.isFailed(url)) {
        if (nextFallback) {
          tryLoad(nextFallback, null);
        } else {
          setImageError(true);
        }
        return;
      }

      assetPreloader.preloadImage(url).then((success) => {
        if (cancelled) return;
        if (success) {
          applyLayerChange(url);
        } else if (nextFallback) {
          tryLoad(nextFallback, null);
        } else {
          setImageError(true);
        }
      });
    };

    tryLoad(primaryUrl, fallbackUrl);

    return () => {
      cancelled = true;
    };
  }, [backgroundId]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      {!imageError ? (
        <div className="relative w-full h-full">
          {/* Camada Anterior (fazendo fade-out durante a transição) */}
          {prevLayer && (
            <img
              src={prevLayer.url}
              alt={`Cenário anterior: ${prevLayer.id}`}
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out opacity-0"
            />
          )}

          {/* Camada Atual (fazendo fade-in suave) */}
          <img
            key={currentLayer.url}
            src={currentLayer.url}
            alt={`Cenário: ${currentLayer.id}`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${
              isCrossFading ? 'animate-fade-in' : 'opacity-100'
            }`}
          />
        </div>
      ) : (
        <BackgroundSvg backgroundId={backgroundId} />
      )}

      {/* Vinheta cinematográfica e sombreamento com iluminação de borda */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40 pointer-events-none" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 35%, rgba(2, 6, 23, 0.75) 100%)',
        }}
      />
    </div>
  );
};
