import React, { useMemo } from 'react';
import {
  Table,
  Badge,
  Text,
  Group,
  Avatar,
  Skeleton,
  Stack,
  Alert,
  Card,
  ScrollArea,
  Box,
} from '@mantine/core';
import { IconAlertCircle, IconTrophy } from '@tabler/icons-react';
import { Driver, Lap, Interval, Stint } from '../../lib/middleware';

export interface LeaderboardRowData {
  position: number;
  driverNumber: number;
  driverName: string;
  driverAcronym: string;
  headshotUrl: string | null;
  teamName: string;
  teamColor: string;
  bestLapTime: string;
  bestLapSeconds: number | null;
  gapToLeader: string;
  interval: string;
  tyreCompound: string | null;
  tyreLaps: number | null;
}

export interface LeaderboardProps {
  drivers: Driver[];
  laps: Lap[];
  intervals?: Interval[];
  stints?: Stint[];
  loading?: boolean;
  error?: string | null;
  title?: string;
}

export function formatLapTime(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined || Number.isNaN(seconds) || seconds <= 0) {
    return '—';
  }
  const mins = Math.floor(seconds / 60);
  const remainderSeconds = seconds % 60;
  const secsFormatted = remainderSeconds.toFixed(3);

  if (mins > 0) {
    const paddedSecs = remainderSeconds < 10 ? `0${secsFormatted}` : secsFormatted;
    return `${mins}:${paddedSecs}`;
  }
  return `${secsFormatted}s`;
}

export function formatGap(gap: number | string | null | undefined, isLeader: boolean): string {
  if (isLeader) return 'LEADER';
  if (gap === null || gap === undefined || gap === '') return '—';
  if (typeof gap === 'number') {
    return gap === 0 ? 'LEADER' : `+${gap.toFixed(3)}s`;
  }
  const str = String(gap).trim();
  if (str === '0' || str.toLowerCase() === 'leader') return 'LEADER';
  if (str.startsWith('+') || str.includes('LAP') || str.includes('L') || str === '—') return str;
  const num = parseFloat(str);
  if (!Number.isNaN(num)) {
    return `+${num.toFixed(3)}s`;
  }
  return str;
}

export function getTyreBadgeProps(compound: string | null | undefined) {
  const c = (compound || '').toUpperCase();
  switch (c) {
    case 'SOFT':
      return { color: 'red', label: 'SOFT', variant: 'filled' as const };
    case 'MEDIUM':
      return { color: 'yellow', label: 'MEDIUM', variant: 'filled' as const };
    case 'HARD':
      return { color: 'gray', label: 'HARD', variant: 'filled' as const };
    case 'INTERMEDIATE':
      return { color: 'green', label: 'INTER', variant: 'filled' as const };
    case 'WET':
      return { color: 'blue', label: 'WET', variant: 'filled' as const };
    default:
      return { color: 'dark', label: compound || 'UNKNOWN', variant: 'light' as const };
  }
}

export function Leaderboard({
  drivers,
  laps,
  intervals = [],
  stints = [],
  loading = false,
  error = null,
  title = 'Race Leaderboard & Lap Timing',
}: LeaderboardProps) {
  const leaderboardData: LeaderboardRowData[] = useMemo(() => {
    if (!drivers || drivers.length === 0) return [];

    // 1. Group laps by driver and calculate best lap
    const bestLapByDriver = new Map<number, number>();
    laps.forEach((lap) => {
      if (typeof lap.lap_duration === 'number' && lap.lap_duration > 0) {
        const currentBest = bestLapByDriver.get(lap.driver_number);
        if (currentBest === undefined || lap.lap_duration < currentBest) {
          bestLapByDriver.set(lap.driver_number, lap.lap_duration);
        }
      }
    });

    // 2. Latest interval / gap by driver
    const latestIntervalByDriver = new Map<number, Interval>();
    intervals.forEach((interval) => {
      // Since interval logs are chronological, updating maps sequentially gets the latest
      latestIntervalByDriver.set(interval.driver_number, interval);
    });

    // 3. Current / Latest stint tyre compound by driver
    const latestStintByDriver = new Map<number, Stint>();
    stints.forEach((stint) => {
      const existing = latestStintByDriver.get(stint.driver_number);
      if (!existing || stint.stint_number >= existing.stint_number) {
        latestStintByDriver.set(stint.driver_number, stint);
      }
    });

    // Map each driver
    const rows = drivers.map((driver) => {
      const bestSeconds = bestLapByDriver.get(driver.driver_number) ?? null;
      const latestInterval = latestIntervalByDriver.get(driver.driver_number);
      const latestStint = latestStintByDriver.get(driver.driver_number);

      const teamColor = driver.team_colour ? `#${driver.team_colour}` : '#868e96';

      return {
        driverNumber: driver.driver_number,
        driverName: driver.full_name || driver.broadcast_name || `Driver #${driver.driver_number}`,
        driverAcronym: driver.name_acronym || `${driver.driver_number}`,
        headshotUrl: driver.headshot_url,
        teamName: driver.team_name || 'Independent',
        teamColor,
        bestLapTime: formatLapTime(bestSeconds),
        bestLapSeconds: bestSeconds,
        rawGap: latestInterval?.gap_to_leader,
        rawInterval: latestInterval?.interval,
        tyreCompound: latestStint?.compound || null,
        tyreLaps: latestStint ? latestStint.lap_end - latestStint.lap_start + 1 : null,
      };
    });

    // Sort order:
    // If intervals exist with valid numeric gaps or 0, sort by gap_to_leader
    // Otherwise, fall back to best lap time
    rows.sort((a, b) => {
      const gapA = a.rawGap;
      const gapB = b.rawGap;

      const numGapA = typeof gapA === 'number' ? gapA : parseFloat(String(gapA));
      const numGapB = typeof gapB === 'number' ? gapB : parseFloat(String(gapB));

      const validGapA = !Number.isNaN(numGapA) && gapA !== null && gapA !== undefined;
      const validGapB = !Number.isNaN(numGapB) && gapB !== null && gapB !== undefined;

      if (validGapA && validGapB) {
        return numGapA - numGapB;
      }
      if (validGapA) return -1;
      if (validGapB) return 1;

      // Fallback: best lap
      if (a.bestLapSeconds !== null && b.bestLapSeconds !== null) {
        return a.bestLapSeconds - b.bestLapSeconds;
      }
      if (a.bestLapSeconds !== null) return -1;
      if (b.bestLapSeconds !== null) return 1;
      return a.driverNumber - b.driverNumber;
    });

    return rows.map((r, index) => {
      const isLeader = index === 0;
      return {
        position: index + 1,
        driverNumber: r.driverNumber,
        driverName: r.driverName,
        driverAcronym: r.driverAcronym,
        headshotUrl: r.headshotUrl,
        teamName: r.teamName,
        teamColor: r.teamColor,
        bestLapTime: r.bestLapTime,
        bestLapSeconds: r.bestLapSeconds,
        gapToLeader: formatGap(r.rawGap, isLeader),
        interval: isLeader ? '—' : formatGap(r.rawInterval, false),
        tyreCompound: r.tyreCompound,
        tyreLaps: r.tyreLaps,
      };
    });
  }, [drivers, laps, intervals, stints]);

  // Overall fastest lap in session
  const fastestLapSeconds = useMemo(() => {
    let best: number | null = null;
    leaderboardData.forEach((row) => {
      if (row.bestLapSeconds !== null) {
        if (best === null || row.bestLapSeconds < best) {
          best = row.bestLapSeconds;
        }
      }
    });
    return best;
  }, [leaderboardData]);

  if (loading) {
    return (
      <Card withBorder shadow="sm" radius="md" p="lg" data-testid="leaderboard-loading">
        <Stack gap="md">
          <Skeleton height={28} width="35%" radius="sm" />
          <Skeleton height={14} width="55%" radius="sm" />
          <Box mt="md">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} height={48} my="xs" radius="sm" />
            ))}
          </Box>
        </Stack>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert
        data-testid="leaderboard-error"
        icon={<IconAlertCircle size="1.2rem" />}
        title="Failed to load timing data"
        color="red"
        variant="light"
        radius="md"
      >
        {error}
      </Alert>
    );
  }

  if (!loading && leaderboardData.length === 0) {
    return (
      <Card withBorder shadow="sm" radius="md" p="xl" ta="center" data-testid="leaderboard-empty">
        <Text size="lg" fw={600} c="dimmed">
          No timing data available for this session
        </Text>
        <Text size="sm" c="dimmed" mt="xs">
          Select a session or check back once timing records are logged.
        </Text>
      </Card>
    );
  }

  return (
    <Card withBorder shadow="sm" radius="md" p="lg" data-testid="leaderboard-card">
      <Group justify="space-between" mb="md">
        <div>
          <Group gap="xs" align="center">
            <IconTrophy size="1.4rem" color="#e03131" />
            <Text fw={700} size="xl">
              {title}
            </Text>
          </Group>
          <Text size="xs" c="dimmed" mt={2}>
            Official session classification, best lap times, interval gaps & tyre compounds
          </Text>
        </div>
        <Badge variant="filled" color="dark" size="lg">
          {leaderboardData.length} Drivers Classified
        </Badge>
      </Group>

      <ScrollArea>
        <Table
          striped
          highlightOnHover
          verticalSpacing="sm"
          horizontalSpacing="md"
          data-testid="leaderboard-table"
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ width: 60, textAlign: 'center' }}>Pos</Table.Th>
              <Table.Th>Driver</Table.Th>
              <Table.Th>Team</Table.Th>
              <Table.Th style={{ textAlign: 'center' }}>Tyre</Table.Th>
              <Table.Th style={{ textAlign: 'right' }}>Best Lap</Table.Th>
              <Table.Th style={{ textAlign: 'right' }}>Interval</Table.Th>
              <Table.Th style={{ textAlign: 'right' }}>Gap to Leader</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {leaderboardData.map((row) => {
              const tyreProps = getTyreBadgeProps(row.tyreCompound);
              const isFastestLap =
                row.bestLapSeconds !== null &&
                fastestLapSeconds !== null &&
                row.bestLapSeconds === fastestLapSeconds;

              return (
                <Table.Tr
                  key={row.driverNumber}
                  data-testid={`leaderboard-row-${row.driverNumber}`}
                >
                  <Table.Td style={{ textAlign: 'center' }}>
                    <Text
                      fw={800}
                      size="sm"
                      c={row.position === 1 ? 'yellow.8' : row.position <= 3 ? 'blue.7' : undefined}
                    >
                      {row.position}
                    </Text>
                  </Table.Td>

                  <Table.Td>
                    <Group gap="sm" wrap="nowrap">
                      <Box
                        style={{
                          width: 4,
                          height: 28,
                          borderRadius: 2,
                          backgroundColor: row.teamColor,
                        }}
                      />
                      <Avatar
                        src={row.headshotUrl}
                        alt={row.driverName}
                        size="md"
                        radius="xl"
                        color="gray"
                      >
                        {row.driverAcronym}
                      </Avatar>
                      <div>
                        <Group gap={6} align="center">
                          <Text fw={600} size="sm">
                            {row.driverName}
                          </Text>
                          <Badge size="xs" variant="outline" color="gray">
                            #{row.driverNumber}
                          </Badge>
                        </Group>
                      </div>
                    </Group>
                  </Table.Td>

                  <Table.Td>
                    <Text size="sm" c="dimmed" fw={500}>
                      {row.teamName}
                    </Text>
                  </Table.Td>

                  <Table.Td style={{ textAlign: 'center' }}>
                    {row.tyreCompound ? (
                      <Badge
                        color={tyreProps.color}
                        variant={tyreProps.variant}
                        size="sm"
                        title={row.tyreLaps ? `Stint duration: ${row.tyreLaps} laps` : undefined}
                      >
                        {tyreProps.label}
                      </Badge>
                    ) : (
                      <Text size="xs" c="dimmed">
                        —
                      </Text>
                    )}
                  </Table.Td>

                  <Table.Td style={{ textAlign: 'right' }}>
                    <Group gap={4} justify="flex-end" align="center">
                      <Text
                        fw={isFastestLap ? 700 : 500}
                        size="sm"
                        c={isFastestLap ? 'violet.6' : undefined}
                        ff="monospace"
                      >
                        {row.bestLapTime}
                      </Text>
                      {isFastestLap && (
                        <Badge size="xs" color="violet" variant="filled">
                          FL
                        </Badge>
                      )}
                    </Group>
                  </Table.Td>

                  <Table.Td style={{ textAlign: 'right' }}>
                    <Text size="sm" ff="monospace" c="dimmed">
                      {row.interval}
                    </Text>
                  </Table.Td>

                  <Table.Td style={{ textAlign: 'right' }}>
                    <Text
                      size="sm"
                      ff="monospace"
                      fw={row.gapToLeader === 'LEADER' ? 700 : 500}
                      c={row.gapToLeader === 'LEADER' ? 'green.7' : undefined}
                    >
                      {row.gapToLeader}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </Card>
  );
}
