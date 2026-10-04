import React, { useEffect, useState } from 'react';
import { Stack, Text } from '@mantine/core';
import { Driver } from '../../lib/middleware';
import { LocationPoint } from '../../lib/types/replay';
import { GETLocations } from '../../lib/services/replay-service';
import { VirtualReplayContainer } from './VirtualReplayContainer';

export interface TrackReplayTabProps {
  sessionKey: string;
  drivers: Driver[];
}

export function TrackReplayTab({ sessionKey, drivers }: TrackReplayTabProps) {
  const [locationsByDriver, setLocationsByDriver] = useState<Record<number, LocationPoint[]>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    const numericSessionKey = Number(sessionKey);
    // Fetch telemetry samples for top drivers
    const targetDrivers = drivers.slice(0, 5).map((d) => d.driver_number);
    const activeDriverNums = targetDrivers.length > 0 ? targetDrivers : [1, 11, 44, 16];

    Promise.all(
      activeDriverNums.map(async (num) => {
        try {
          const locs = await GETLocations(numericSessionKey, num);
          return { driverNum: num, locs };
        } catch {
          return { driverNum: num, locs: [] };
        }
      })
    )
      .then((results) => {
        if (!isMounted) return;
        const byDriver: Record<number, LocationPoint[]> = {};
        results.forEach((r) => {
          if (r.locs && r.locs.length > 0) {
            byDriver[r.driverNum] = r.locs;
          }
        });
        setLocationsByDriver(byDriver);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || 'Failed to load telemetry replay');
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [sessionKey, drivers]);

  return (
    <Stack gap="md">
      <Text size="sm" c="dimmed">
        Real-time 60 FPS car telemetry simulation interpolated directly from OpenF1 coordinates.
      </Text>
      <VirtualReplayContainer
        locationsByDriver={locationsByDriver}
        drivers={drivers}
        loading={loading}
        error={error}
      />
    </Stack>
  );
}
