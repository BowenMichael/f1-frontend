import React, { useEffect, useState } from 'react';
import { Box, Group, Text, Loader, Alert, Tabs, Badge } from '@mantine/core';
import { IconUsers, IconTrophy } from '@tabler/icons-react';
import {
  GETDrivers,
  GETLaps,
  GETIntervals,
  GETStints,
  Driver,
  Lap,
  Interval,
  Stint,
} from '../../lib/middleware';
import { DriverLineup } from './DriverLineup';
import { Leaderboard } from '../Leaderboard/Leaderboard';

export interface SessionDashboardProps {
  sessionKey: number;
}

export function SessionDashboard({ sessionKey }: SessionDashboardProps) {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [laps, setLaps] = useState<Lap[]>([]);
  const [intervals, setIntervals] = useState<Interval[]>([]);
  const [stints, setStints] = useState<Stint[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    Promise.all([
      GETDrivers(undefined, sessionKey),
      GETLaps(sessionKey),
      GETIntervals(sessionKey),
      GETStints(sessionKey),
    ])
      .then(([driversData, lapsData, intervalsData, stintsData]) => {
        if (!isMounted) return;
        // Make drivers unique by driver_number
        const uniqueDrivers = Array.from(
          new Map(driversData.map((d) => [d.driver_number, d])).values()
        );
        setDrivers(uniqueDrivers);
        setLaps(lapsData);
        setIntervals(intervalsData);
        setStints(stintsData);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : 'Failed to load session telemetry');
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [sessionKey]);

  return (
    <Box mt="md">
      <Group justify="space-between" align="center" mb="md">
        <Text fw={700} size="md">
          Session Data
        </Text>
        {!loading && (
          <Badge variant="outline" color="gray">
            {drivers.length} Drivers
          </Badge>
        )}
      </Group>

      {loading && (
        <Box py={50} ta="center">
          <Loader size="lg" color="red" />
          <Text c="dimmed" size="sm" mt="sm">
            Loading session telemetry (Laps, Intervals, Stints)...
          </Text>
        </Box>
      )}

      {error && (
        <Alert color="red" title="Telemetry Error" mb="md">
          {error}
        </Alert>
      )}

      {!loading && !error && (
        <Tabs defaultValue="leaderboard" color="red">
          <Tabs.List mb="md">
            <Tabs.Tab
              value="leaderboard"
              leftSection={<IconTrophy size="1.2rem" />}
            >
              Leaderboard
            </Tabs.Tab>
            <Tabs.Tab
              value="lineup"
              leftSection={<IconUsers size="1.2rem" />}
            >
              Driver Lineup
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="leaderboard">
            <Leaderboard
              drivers={drivers}
              laps={laps}
              intervals={intervals}
              stints={stints}
              loading={loading}
              error={error}
            />
          </Tabs.Panel>

          <Tabs.Panel value="lineup">
            <DriverLineup drivers={drivers} loading={loading} error={error} />
          </Tabs.Panel>
        </Tabs>
      )}
    </Box>
  );
}
