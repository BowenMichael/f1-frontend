import React from 'react';
import { DriverState } from '../../lib/types/replay';

export interface DriverMarkerProps {
  driver: DriverState;
}

export function DriverMarker({ driver }: DriverMarkerProps) {
  const { x, y, acronym, teamColour } = driver;

  return (
    <g
      transform={`translate(${x}, ${y})`}
      style={{
        transition: 'transform 0.05s linear',
        cursor: 'pointer',
      }}
    >
      {/* Outer subtle glow */}
      <circle r={10} fill={teamColour} opacity={0.3} />

      {/* Main colored car dot */}
      <circle r={6} fill={teamColour} stroke="#ffffff" strokeWidth={1.5} />

      {/* Driver Acronym Tag */}
      <rect
        x={8}
        y={-14}
        width={32}
        height={16}
        rx={3}
        fill="rgba(20, 20, 20, 0.85)"
        stroke={teamColour}
        strokeWidth={1}
      />
      <text
        x={24}
        y={-3}
        fill="#ffffff"
        fontSize="9px"
        fontWeight="bold"
        fontFamily="sans-serif"
        textAnchor="middle"
      >
        {acronym}
      </text>
    </g>
  );
}
