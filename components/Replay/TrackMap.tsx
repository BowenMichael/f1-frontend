import React from 'react';
import { TrackSilhouette } from './TrackSilhouette';
import { DriverMarker } from './DriverMarker';
import { DriverState } from '../../lib/types/replay';

export interface TrackMapProps {
  svgPath: string;
  driverStates: DriverState[];
  viewBoxWidth?: number;
  viewBoxHeight?: number;
}

function TrackMapComponent({
  svgPath,
  driverStates,
  viewBoxWidth = 800,
  viewBoxHeight = 500,
}: TrackMapProps) {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        backgroundColor: '#121214',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.8)',
      }}
    >
      <svg
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        style={{
          width: '100%',
          height: 'auto',
          display: 'block',
          maxHeight: '600px',
        }}
      >
        {/* Render Track Layout */}
        <TrackSilhouette svgPath={svgPath} />

        {/* Render Real-Time Drivers */}
        {driverStates.map((driver) => (
          <DriverMarker key={driver.driver_number} driver={driver} />
        ))}
      </svg>
    </div>
  );
}

export const TrackMap = React.memo(TrackMapComponent);
