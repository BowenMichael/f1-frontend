import React, { useState, useEffect } from 'react';
import { Stack, Paper, Title, Text, LoadingOverlay, Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { Driver, Lap } from '../../lib/middleware';
import { TelemetryComparisonPoint } from '../../models/telemetry';
import { fetchDriverFastestLapTelemetry, alignTelemetry } from '../../services/telemetryService';
import { DriverSelector } from './DriverSelector';
import { TelemetryChart } from './TelemetryChart';

interface TelemetryComparisonProps {
  sessionKey: number;
  drivers: Driver[];
  laps: Lap[];
}

export function TelemetryComparison({ sessionKey, drivers, laps }: TelemetryComparisonProps) {
  const [driverA, setDriverA] = useState<number | null>(null);
  const [driverB, setDriverB] = useState<number | null>(null);
  const [chartData, setChartData] = useState<TelemetryComparisonPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (drivers.length >= 2) {
      setDriverA(drivers[0].driver_number);
      setDriverB(drivers[1].driver_number);
    } else if (drivers.length === 1) {
      setDriverA(drivers[0].driver_number);
    }
  }, [drivers, sessionKey]);

  useEffect(() => {
    if (!driverA || !driverB || !sessionKey) {
      setChartData([]);
      return () => {};
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    Promise.all([
      fetchDriverFastestLapTelemetry(sessionKey, driverA, laps),
      fetchDriverFastestLapTelemetry(sessionKey, driverB, laps),
    ])
      .then(([telemetryA, telemetryB]) => {
        if (!isMounted) return;
        if (!telemetryA.length && !telemetryB.length) {
          setError('No telemetry data available for the selected drivers.');
          setChartData([]);
        } else {
          const aligned = alignTelemetry(telemetryA, telemetryB);
          setChartData(aligned);
        }
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || 'Failed to fetch telemetry data.');
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [driverA, driverB, sessionKey, laps]);

  const driverAObj = drivers.find((d) => d.driver_number === driverA);
  const driverBObj = drivers.find((d) => d.driver_number === driverB);

  const driverAName = driverAObj
    ? driverAObj.name_acronym || driverAObj.broadcast_name || `Driver #${driverA}`
    : 'Driver A';
  const driverBName = driverBObj
    ? driverBObj.name_acronym || driverBObj.broadcast_name || `Driver #${driverB}`
    : 'Driver B';

  return (
    <Paper withBorder p="md" radius="md" pos="relative">
      <LoadingOverlay visible={loading} overlayProps={{ radius: 'sm', blur: 2 }} />
      <Stack gap="md">
        <div>
          <Title order={4}>Telemetry Comparison Viewer</Title>
          <Text size="xs" c="dimmed">
            Compare speed, throttle, and brake curves over fastest laps (OpenF1 /car_data)
          </Text>
        </div>

        <DriverSelector
          drivers={drivers}
          driverA={driverA}
          driverB={driverB}
          onSelectDriverA={setDriverA}
          onSelectDriverB={setDriverB}
        />

        {error && (
          <Alert icon={<IconAlertCircle size="1rem" />} title="Notice" color="yellow">
            {error}
          </Alert>
        )}

        <TelemetryChart data={chartData} driverAName={driverAName} driverBName={driverBName} />
      </Stack>
    </Paper>
  );
}
