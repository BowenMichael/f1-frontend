import React from 'react';
import {
  Table,
  Badge,
  Text,
  Group,
  Skeleton,
  Stack,
  Alert,
  Card,
  ScrollArea,
  Box,
} from '@mantine/core';
import { IconAlertCircle, IconTrophy } from '@tabler/icons-react';
import { LeaderboardProps } from './types';
import { useLeaderboardData } from './useLeaderboardData';
import { LeaderboardRow } from './LeaderboardRow';

export * from './types';
export * from './formatters';

export function Leaderboard({
  drivers,
  laps,
  intervals = [],
  stints = [],
  loading = false,
  error = null,
  title = 'Race Leaderboard & Lap Timing',
}: LeaderboardProps) {
  const { leaderboardData, fastestLapSeconds } = useLeaderboardData(
    drivers,
    laps,
    intervals,
    stints
  );

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
            {leaderboardData.map((row) => (
              <LeaderboardRow
                key={row.driverNumber}
                row={row}
                isFastestLap={
                  row.bestLapSeconds !== null &&
                  fastestLapSeconds !== null &&
                  row.bestLapSeconds === fastestLapSeconds
                }
              />
            ))}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </Card>
  );
}
