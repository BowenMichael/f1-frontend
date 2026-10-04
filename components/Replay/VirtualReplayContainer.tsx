import React, { useMemo } from 'react';
import { Stack, Alert, Loader, Center, Text } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { LocationPoint } from '../../lib/types/replay';
import { Driver } from '../../lib/middleware';
import { computeBoundingBox, createSvgPath } from '../../lib/utils/coordinate-mapper';
import { useReplayClock } from '../../lib/hooks/useReplayClock';
import { useDriverPositions } from '../../lib/hooks/useDriverPositions';
import { TrackMap } from './TrackMap';
import { ReplayControls } from './ReplayControls';

export interface VirtualReplayContainerProps {
  locationsByDriver: Record<number, LocationPoint[]>;
  drivers: Driver[];
  trackOutlinePoints?: { x: number; y: number }[];
  loading?: boolean;
  error?: string | null;
}

export function VirtualReplayContainer({
  locationsByDriver,
  drivers,
  trackOutlinePoints = [],
  loading = false,
  error = null,
}: VirtualReplayContainerProps) {
  // Aggregate all points to build bounding box and outline
  const { allPoints, startTime, endTime } = useMemo(() => {
    const pts: { x: number; y: number }[] = [...trackOutlinePoints];
    let minT = Infinity;
    let maxT = -Infinity;

    Object.values(locationsByDriver).forEach((driverPts) => {
      driverPts.forEach((p) => {
        pts.push({ x: p.x, y: p.y });
        const t = new Date(p.date).getTime();
        if (t < minT) minT = t;
        if (t > maxT) maxT = t;
      });
    });

    return {
      allPoints: pts,
      startTime: minT !== Infinity ? minT : 0,
      endTime: maxT !== -Infinity ? maxT : 1000,
    };
  }, [locationsByDriver, trackOutlinePoints]);

  const boundingBox = useMemo(() => computeBoundingBox(allPoints), [allPoints]);

  const svgPath = useMemo(() => {
    // If outline provided, use it; otherwise use first driver's path
    const outline =
      trackOutlinePoints.length > 0
        ? trackOutlinePoints
        : Object.values(locationsByDriver)[0] || [];
    return createSvgPath(outline, boundingBox, 800, 500);
  }, [trackOutlinePoints, locationsByDriver, boundingBox]);

  const { isPlaying, speed, currentTime, togglePlay, setSpeed, seek, reset } = useReplayClock({
    startTime,
    endTime,
  });

  const driverStates = useDriverPositions({
    locationsByDriver,
    drivers,
    currentTime,
    boundingBox,
    viewBoxWidth: 800,
    viewBoxHeight: 500,
  });

  if (loading) {
    return (
      <Center p="xl" h={400}>
        <Stack align="center" gap="sm">
          <Loader color="red" size="lg" />
          <Text size="sm" c="dimmed">
            Loading Track Replay Telemetry...
          </Text>
        </Stack>
      </Center>
    );
  }

  if (error) {
    return (
      <Alert icon={<IconAlertCircle size="1.2rem" />} title="Replay Error" color="red">
        {error}
      </Alert>
    );
  }

  return (
    <Stack gap="md">
      <TrackMap
        svgPath={svgPath}
        driverStates={driverStates}
        locationsByDriver={locationsByDriver}
        boundingBox={boundingBox}
        viewBoxWidth={800}
        viewBoxHeight={500}
      />
      <ReplayControls
        isPlaying={isPlaying}
        speed={speed}
        currentTime={currentTime}
        startTime={startTime}
        endTime={endTime}
        onTogglePlay={togglePlay}
        onSpeedChange={setSpeed}
        onSeek={seek}
        onReset={reset}
      />
    </Stack>
  );
}
