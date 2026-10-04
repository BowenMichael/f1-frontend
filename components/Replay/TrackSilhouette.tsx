import React from 'react';

export interface TrackSilhouetteProps {
  svgPath: string;
}

export function TrackSilhouette({ svgPath }: TrackSilhouetteProps) {
  if (!svgPath) return null;

  return (
    <g className="track-silhouette">
      <defs>
        {/* Glow filter for neon circuit styling */}
        <filter id="track-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" result="blur1" />
          <feGaussianBlur stdDeviation="14" result="blur2" />
          <feMerge>
            <feMergeNode in="blur2" />
            <feMergeNode in="blur1" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Outer ambient glow */}
      <path
        d={svgPath}
        fill="none"
        stroke="#e03131"
        strokeWidth="14"
        strokeOpacity="0.18"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Mid glow */}
      <path
        d={svgPath}
        fill="none"
        stroke="#ff6b6b"
        strokeWidth="7"
        strokeOpacity="0.45"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#track-glow)"
      />

      {/* Main crisp circuit track line */}
      <path
        d={svgPath}
        fill="none"
        stroke="#ffffff"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  );
}
