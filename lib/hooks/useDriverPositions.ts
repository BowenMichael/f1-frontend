import { useMemo } from 'react';
import { LocationPoint, DriverState, TrackBoundingBox } from '../types/replay';
import { Driver } from '../middleware';
import { interpolateCarPosition } from '../utils/interpolation';
import { normalizeCoordinate } from '../utils/coordinate-mapper';

export interface UseDriverPositionsOptions {
  locationsByDriver: Record<number, LocationPoint[]>;
  drivers: Driver[];
  currentTime: number;
  boundingBox: TrackBoundingBox;
  viewBoxWidth?: number;
  viewBoxHeight?: number;
}

const DEFAULT_COLORS: Record<string, string> = {
  RedBull: '#3671C6',
  Ferrari: '#E80020',
  Mercedes: '#27F4D2',
  Alpine: '#FF87BC',
  McLaren: '#FF8000',
  Sauber: '#52E252',
  AstonMartin: '#229971',
  Haas: '#B6BABD',
  RB: '#6692FF',
  Williams: '#64C4FF',
};

export function useDriverPositions({
  locationsByDriver,
  drivers,
  currentTime,
  boundingBox,
  viewBoxWidth = 800,
  viewBoxHeight = 500,
}: UseDriverPositionsOptions): DriverState[] {
  const driverMetadataMap = useMemo(() => {
    const map = new Map<number, Driver>();
    drivers.forEach((d) => map.set(d.driver_number, d));
    return map;
  }, [drivers]);

  return useMemo(() => {
    const result: DriverState[] = [];

    Object.keys(locationsByDriver).forEach((driverNumberStr) => {
      const driverNum = Number(driverNumberStr);
      const points = locationsByDriver[driverNum];
      if (!points || points.length === 0) return;

      const interpolatedRaw = interpolateCarPosition(points, currentTime);
      if (!interpolatedRaw) return;

      const normalized = normalizeCoordinate(
        interpolatedRaw.x,
        interpolatedRaw.y,
        boundingBox,
        viewBoxWidth,
        viewBoxHeight
      );

      const metadata = driverMetadataMap.get(driverNum);
      const acronym = metadata?.name_acronym || `D${driverNum}`;
      const fullName = metadata?.full_name || `Driver ${driverNum}`;
      const teamColour = metadata?.team_colour
        ? `#${metadata.team_colour}`
        : DEFAULT_COLORS[metadata?.team_name?.replace(/\s+/g, '') || ''] || '#e03131';

      result.push({
        driver_number: driverNum,
        acronym,
        fullName,
        teamColour,
        x: normalized.x,
        y: normalized.y,
      });
    });

    return result;
  }, [locationsByDriver, currentTime, boundingBox, viewBoxWidth, viewBoxHeight, driverMetadataMap]);
}
