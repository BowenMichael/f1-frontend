import React, { useEffect, useState } from 'react';
import {
  Container,
  Title,
  Text,
  Group,
  Select,
  Stack,
  Tabs,
  Badge,
  Paper,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import { IconFlag, IconRefresh, IconCalendar, IconDeviceAnalytics } from '@tabler/icons-react';
import { RaceExplorer } from '../components/RaceExplorer/RaceExplorer';
import { ColorSchemeToggle } from '../components/ColorSchemeToggle/ColorSchemeToggle';
import { DeploymentBadge } from '../components/DeploymentBadge/DeploymentBadge';
import { PatchNotesButton } from '../components/PatchNotes';
import { Leaderboard } from '../components/Leaderboard/Leaderboard';
import { TrackReplayTab } from '../components/Replay';
import { TelemetryComparison } from '../components/TelemetryComparison/TelemetryComparison';
import {
  Driver,
  Lap,
  Interval,
  Stint,
  GETSessions,
  GETDrivers,
  GETLaps,
  GETIntervals,
  GETStints,
} from '../lib/middleware';

// Default featured sessions from the 2023 season
const FEATURED_SESSIONS = [
  { value: '9141', label: '🇧🇪 2023 Belgian Grand Prix (Race)' },
  { value: '9197', label: '🇦🇪 2023 Abu Dhabi Grand Prix (Race)' },
  { value: '7953', label: '🇧🇭 2023 Bahrain Grand Prix (Race)' },
  { value: '7787', label: '🇦🇺 2023 Australian Grand Prix (Race)' },
  { value: '9158', label: '🇸🇬 2023 Singapore Grand Prix (Practice 1)' },
];

export default function HomePage() {
  const [selectedSessionKey, setSelectedSessionKey] = useState<string>('9141');
  const [sessionList, setSessionList] =
    useState<{ value: string; label: string }[]>(FEATURED_SESSIONS);

  const [activeTab, setActiveTab] = useState<string | null>('leaderboard');

  // Leaderboard data state
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [laps, setLaps] = useState<Lap[]>([]);
  const [intervals, setIntervals] = useState<Interval[]>([]);
  const [stints, setStints] = useState<Stint[]>([]);

  // Load session metadata if available
  useEffect(() => {
    let isMounted = true;
    GETSessions(undefined, 'Race', 2023)
      .then((sessions) => {
        if (!isMounted || !sessions.length) return;
        const options = sessions.map((s) => ({
          value: s.session_key.toString(),
          label: `${s.country_name} Grand Prix - ${s.session_name} (${s.circuit_short_name})`,
        }));
        // Merge with defaults avoiding duplicates
        const map = new Map<string, string>();
        FEATURED_SESSIONS.forEach((item) => map.set(item.value, item.label));
        options.forEach((item) => map.set(item.value, item.label));
        const merged = Array.from(map.entries()).map(([value, label]) => ({ value, label }));
        setSessionList(merged);
      })
      .catch(() => {
        // Fallback to initial featured sessions
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const fetchSessionTimingData = (sessionKeyStr: string) => {
    const sessionKey = parseInt(sessionKeyStr, 10);
    if (Number.isNaN(sessionKey)) return;

    setLoading(true);
    setError(null);

    Promise.all([
      GETDrivers(undefined, sessionKey),
      GETLaps(sessionKey),
      GETIntervals(sessionKey),
      GETStints(sessionKey),
    ])
      .then(([driversData, lapsData, intervalsData, stintsData]) => {
        // Deduplicate drivers by driver_number
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
        setError(err instanceof Error ? err.message : 'Failed to load timing data for session');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSessionTimingData(selectedSessionKey);
  }, [selectedSessionKey]);

  const currentSessionLabel =
    sessionList.find((s) => s.value === selectedSessionKey)?.label ||
    `Session #${selectedSessionKey}`;

  return (
    <Container size="xl" py="xl">
      {/* Top Header & Navigation Bar */}
      <Paper withBorder p="md" radius="md" mb="xl" shadow="xs">
        <Group justify="space-between" align="center" wrap="wrap" gap="md">
          <Group gap="xs">
            <IconFlag size="1.6rem" color="#e03131" />
            <div>
              <Title order={3} fw={800} style={{ letterSpacing: -0.5 }}>
                Formula 1 Live & Static Timing
              </Title>
              <Text size="xs" c="dimmed">
                Powered by OpenF1 REST API • Leaderboard & Calendar Replay
              </Text>
            </div>
          </Group>

          <Group gap="sm" align="center">
            {activeTab === 'leaderboard' && (
              <>
                <Select
                  data={sessionList}
                  value={selectedSessionKey}
                  onChange={(val) => {
                    if (val) setSelectedSessionKey(val);
                  }}
                  placeholder="Select Grand Prix Session"
                  searchable
                  w={340}
                  radius="md"
                />
                <Tooltip label="Refresh Timing Data">
                  <ActionIcon
                    variant="light"
                    color="red"
                    size="lg"
                    radius="md"
                    onClick={() => fetchSessionTimingData(selectedSessionKey)}
                    loading={loading}
                  >
                    <IconRefresh size="1.2rem" />
                  </ActionIcon>
                </Tooltip>
              </>
            )}
            <DeploymentBadge />
            <PatchNotesButton />
            <ColorSchemeToggle />
          </Group>
        </Group>
      </Paper>

      {/* Tabs navigation: Leaderboard (Milestone 2) & Race Calendar Explorer */}
      <Tabs value={activeTab} onChange={setActiveTab} radius="md" variant="pills" mb="lg">
        <Tabs.List>
          <Tabs.Tab
            value="leaderboard"
            leftSection={<IconFlag size="1rem" />}
            rightSection={
              <Badge size="xs" color="red" variant="filled">
                Live Laps
              </Badge>
            }
          >
            Timing Leaderboard
          </Tabs.Tab>
          <Tabs.Tab value="calendar" leftSection={<IconCalendar size="1rem" />}>
            Race Calendar & Drivers
          </Tabs.Tab>
          <Tabs.Tab
            value="replay"
            leftSection={<IconDeviceAnalytics size="1rem" />}
            rightSection={
              <Badge size="xs" color="yellow" variant="light">
                2D Vision
              </Badge>
            }
          >
            2D Track Replay
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="leaderboard" pt="md">
          <Stack gap="lg">
            <Leaderboard
              drivers={drivers}
              laps={laps}
              intervals={intervals}
              stints={stints}
              loading={loading}
              error={error}
              title={`Classification & Lap Timing — ${currentSessionLabel}`}
            />
            <TelemetryComparison
              sessionKey={parseInt(selectedSessionKey, 10)}
              drivers={drivers}
              laps={laps}
            />
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="calendar" pt="md">
          <RaceExplorer />
        </Tabs.Panel>

        <Tabs.Panel value="replay" pt="md">
          <TrackReplayTab sessionKey={selectedSessionKey} drivers={drivers} />
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}
