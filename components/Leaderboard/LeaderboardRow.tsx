import React from 'react';
import { Table, Badge, Text, Group, Avatar, Box } from '@mantine/core';
import { LeaderboardRowData } from './types';
import { getTyreBadgeProps } from './formatters';

export interface LeaderboardRowProps {
  row: LeaderboardRowData;
  isFastestLap: boolean;
}

export function LeaderboardRow({ row, isFastestLap }: LeaderboardRowProps) {
  const tyreProps = getTyreBadgeProps(row.tyreCompound);

  return (
    <Table.Tr data-testid={`leaderboard-row-${row.driverNumber}`}>
      <Table.Td style={{ width: 60, textAlign: 'center' }}>
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
          <Avatar src={row.headshotUrl} alt={row.driverName} size="md" radius="xl" color="gray">
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
}
