import React from 'react';
import { Group, Select, Text, Stack } from '@mantine/core';
import { Driver } from '../../lib/middleware';

interface DriverSelectorProps {
  drivers: Driver[];
  driverA: number | null;
  driverB: number | null;
  onSelectDriverA: (val: number | null) => void;
  onSelectDriverB: (val: number | null) => void;
}

export function DriverSelector({
  drivers,
  driverA,
  driverB,
  onSelectDriverA,
  onSelectDriverB,
}: DriverSelectorProps) {
  const driverOptions = drivers.map((d) => ({
    value: d.driver_number.toString(),
    label: `#${d.driver_number} - ${d.broadcast_name || d.full_name} (${d.name_acronym || ''})`,
  }));

  return (
    <Stack gap="xs">
      <Text fw={600} size="sm">
        Select Drivers to Compare
      </Text>
      <Group grow>
        <Select
          label="Driver A (Primary - Blue)"
          placeholder="Select Driver A"
          data={driverOptions}
          value={driverA !== null ? driverA.toString() : null}
          onChange={(val) => onSelectDriverA(val ? parseInt(val, 10) : null)}
          searchable
          clearable
        />
        <Select
          label="Driver B (Comparison - Red)"
          placeholder="Select Driver B"
          data={driverOptions}
          value={driverB !== null ? driverB.toString() : null}
          onChange={(val) => onSelectDriverB(val ? parseInt(val, 10) : null)}
          searchable
          clearable
        />
      </Group>
    </Stack>
  );
}
