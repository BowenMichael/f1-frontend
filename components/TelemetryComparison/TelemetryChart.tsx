import React from 'react';
import { Box, Text, Paper, Group, Badge, Stack } from '@mantine/core';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { TelemetryComparisonPoint } from '../../models/telemetry';

interface TelemetryChartProps {
  data: TelemetryComparisonPoint[];
  driverAName: string;
  driverBName: string;
}

export function TelemetryChart({ data, driverAName, driverBName }: TelemetryChartProps) {
  if (!data || data.length === 0) {
    return (
      <Paper p="xl" withBorder radius="md" style={{ textAlign: 'center' }}>
        <Text c="dimmed">No telemetry data available for the selected drivers.</Text>
      </Paper>
    );
  }

  return (
    <Stack gap="md">
      <Paper p="md" withBorder radius="md">
        <Group justify="space-between" mb="xs">
          <Text fw={600} size="sm">
            Speed (km/h) vs. Lap Distance (%)
          </Text>
          <Group gap="xs">
            <Badge color="blue" variant="light">
              {driverAName} (Speed)
            </Badge>
            <Badge color="red" variant="light">
              {driverBName} (Speed)
            </Badge>
          </Group>
        </Group>

        <Box style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis
                dataKey="distancePercent"
                unit="%"
                tick={{ fontSize: 12 }}
                label={{ value: 'Lap Distance (%)', position: 'insideBottomRight', offset: -5 }}
              />
              <YAxis
                yAxisId="speed"
                domain={[50, 350]}
                unit=" km/h"
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                formatter={(value: any, name: string) => [
                  `${value} km/h`,
                  name === 'speedA' ? `${driverAName} Speed` : `${driverBName} Speed`,
                ]}
                labelFormatter={(label: any) => `Lap Distance: ${label}%`}
              />
              <Line
                yAxisId="speed"
                type="monotone"
                dataKey="speedA"
                name="speedA"
                stroke="#228be6"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                yAxisId="speed"
                type="monotone"
                dataKey="speedB"
                name="speedB"
                stroke="#fa5252"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </Box>
      </Paper>

      <Paper p="md" withBorder radius="md">
        <Group justify="space-between" mb="xs">
          <Text fw={600} size="sm">
            Throttle (%) & Brake (%) Input Overlays
          </Text>
          <Group gap="xs">
            <Badge color="teal" variant="light">
              {driverAName} (Throttle/Brake)
            </Badge>
            <Badge color="orange" variant="light">
              {driverBName} (Throttle/Brake)
            </Badge>
          </Group>
        </Group>

        <Box style={{ width: '100%', height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="distancePercent" unit="%" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 12 }} />
              <Tooltip
                labelFormatter={(label: any) => `Lap Distance: ${label}%`}
              />
              <Legend />
              <Bar
                dataKey="throttleA"
                name={`${driverAName} Throttle`}
                fill="#20c997"
                opacity={0.6}
                isAnimationActive={false}
              />
              <Bar
                dataKey="brakeA"
                name={`${driverAName} Brake`}
                fill="#ff6b6b"
                opacity={0.6}
                isAnimationActive={false}
              />
              <Bar
                dataKey="throttleB"
                name={`${driverBName} Throttle`}
                fill="#fd7e14"
                opacity={0.5}
                isAnimationActive={false}
              />
              <Bar
                dataKey="brakeB"
                name={`${driverBName} Brake`}
                fill="#845ef7"
                opacity={0.5}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </Box>
      </Paper>
    </Stack>
  );
}
