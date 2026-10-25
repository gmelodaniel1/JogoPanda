import React from 'react';
import { getBackgroundLabel, normalizeBackgroundId } from '../../utils/assetHelper';

interface BackgroundSvgProps {
  backgroundId?: string;
}

/**
 * Placeholder exibido enquanto a imagem do cenário não existir em
 * public/assets/backgrounds/<id>.webp (ou .jpg).
 */
export const BackgroundSvg: React.FC<BackgroundSvgProps> = ({ backgroundId = '' }) => {
  const resolvedId = normalizeBackgroundId(backgroundId);
  const label = getBackgroundLabel(backgroundId);

  return (
    <svg
      viewBox="0 0 1920 1080"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="bgPlaceholderSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1e1b4b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <pattern id="bgPlaceholderGrid" width="80" height="80" patternUnits="userSpaceOnUse">
          <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#334155" strokeWidth="1" opacity="0.35" />
        </pattern>
      </defs>

      <rect width="1920" height="1080" fill="url(#bgPlaceholderSky)" />
      <rect width="1920" height="1080" fill="url(#bgPlaceholderGrid)" />
      {/* Linha do chão */}
      <rect y="760" width="1920" height="320" fill="#020617" opacity="0.55" />

      <text
        x="960"
        y="420"
        textAnchor="middle"
        fill="#cbd5e1"
        fontSize="56"
        fontWeight="bold"
        fontFamily="sans-serif"
        opacity="0.55"
      >
        {label}
      </text>
      <text
        x="960"
        y="480"
        textAnchor="middle"
        fill="#94a3b8"
        fontSize="26"
        fontFamily="monospace"
        opacity="0.5"
      >
        public/assets/backgrounds/{resolvedId}.webp
      </text>
    </svg>
  );
};
