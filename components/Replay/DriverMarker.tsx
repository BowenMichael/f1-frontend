import React, { useEffect, useRef } from 'react';
import { DriverState, LocationPoint, TrackBoundingBox } from '../../lib/types/replay';
import { interpolateCarPosition } from '../../lib/utils/interpolation';
import { normalizeCoordinate } from '../../lib/utils/coordinate-mapper';

export interface DriverMarkerProps {
  driver: DriverState;
  points?: LocationPoint[];
  boundingBox?: TrackBoundingBox;
  viewBoxWidth?: number;
  viewBoxHeight?: number;
}

export function DriverMarker({
  driver,
  points,
  boundingBox,
  viewBoxWidth = 800,
  viewBoxHeight = 500,
}: DriverMarkerProps) {
  const { x: initialX, y: initialY, acronym, teamColour } = driver;
  const markerRef = useRef<SVGGElement>(null);
  const cursorIndexRef = useRef<number>(0);

  useEffect(() => {
    if (!points || points.length === 0 || !boundingBox) {
      return undefined;
    }

    const handleTick = (e: Event) => {
      const customEvent = e as CustomEvent<number>;
      const currentTime = customEvent.detail;
      if (typeof currentTime !== 'number') return;

      const interpolated = interpolateCarPosition(points, currentTime, cursorIndexRef.current);
      if (!interpolated) return;

      cursorIndexRef.current = interpolated.index;

      const norm = normalizeCoordinate(
        interpolated.x,
        interpolated.y,
        boundingBox,
        viewBoxWidth,
        viewBoxHeight
      );

      if (markerRef.current) {
        markerRef.current.setAttribute('transform', `translate(${norm.x}, ${norm.y})`);
      }
    };

    window.addEventListener('replayTick', handleTick);
    return () => {
      window.removeEventListener('replayTick', handleTick);
    };
  }, [points, boundingBox, viewBoxWidth, viewBoxHeight]);

  return (
    <g
      ref={markerRef}
      transform={`translate(${initialX}, ${initialY})`}
      style={{
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
