import React from 'react';
import { SimpleGrid, Card, Avatar, Badge, Group, Text, Paper, Box } from '@mantine/core';
import { Driver } from '../../../lib/middleware';
import classes from '../RaceExplorer.module.css';

interface DriverGridProps {
  drivers: Driver[];
}

export function DriverGrid({ drivers }: DriverGridProps) {
  if (drivers.length === 0) {
    return (
      <Paper p="xl" withBorder radius="md" ta="center">
        <Text c="dimmed">No driver records found for this session.</Text>
      </Paper>
    );
  }

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="md">
      {drivers.map((driver) => {
        const teamColor = driver.team_colour ? `#${driver.team_colour}` : '#e03131';

        return (
          <Card
            key={driver.driver_number}
            shadow="xs"
            padding="md"
            radius="md"
            withBorder
            className={classes.driverCard}
            style={{
              borderTop: `4px solid ${teamColor}`,
            }}
          >
            <Group justify="space-between" mb="xs">
              <Badge color="dark" variant="filled" size="md">
                #{driver.driver_number}
              </Badge>
              {driver.country_code && (
                <Badge variant="light" color="gray" size="sm">
                  {driver.country_code}
                </Badge>
              )}
            </Group>

            <Group align="center" gap="md" my="xs">
              <Avatar
                src={driver.headshot_url}
                alt={driver.full_name}
                size="lg"
                radius="xl"
                color="red"
              >
                {driver.name_acronym || driver.driver_number}
              </Avatar>

              <Box style={{ flex: 1, minWidth: 0 }}>
                <Text fw={700} size="sm" truncate>
                  {driver.full_name}
                </Text>
                <Text size="xs" c="dimmed">
                  {driver.broadcast_name}
                </Text>
              </Box>
            </Group>

            <Group justify="space-between" mt="sm">
              <Text size="xs" fw={600} c="dimmed" truncate>
                {driver.team_name || 'Independent'}
              </Text>
              <Badge
                variant="dot"
                styles={{
                  root: { color: teamColor },
                }}
              >
                {driver.name_acronym}
              </Badge>
            </Group>
          </Card>
        );
      })}
    </SimpleGrid>
  );
}
