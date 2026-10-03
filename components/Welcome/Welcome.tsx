import {
  Title,
  Text,
  Container,
  SimpleGrid,
  Card,
  Avatar,
  Badge,
  Group,
  Loader,
  Alert,
  Stack,
  Box,
} from '@mantine/core';
import { useEffect, useState } from 'react';
import { GETDrivers, Driver } from '../../lib/middleware';
import classes from './Welcome.module.css';

export function Welcome() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    // Session 9158: 2023 Belgian Grand Prix weekend
    GETDrivers(undefined, 9158)
      .then((data) => {
        if (!isMounted) return;
        // Filter out duplicate driver records if present in session responses
        const uniqueDrivers = Array.from(
          new Map(data.map((d) => [d.driver_number, d])).values()
        );
        setDrivers(uniqueDrivers);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : 'Failed to fetch drivers');
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Container size="lg" py="xl">
      <Title className={classes.title} ta="center" mt={40}>
        Welcome to{' '}
        <Text
          inherit
          variant="gradient"
          component="span"
          gradient={{ from: 'red', to: 'orange' }}
        >
          F1 Viewer
        </Text>
      </Title>

      <Text c="dimmed" ta="center" size="lg" maw={600} mx="auto" mt="sm">
        Explore 2023 Formula 1 session drivers powered by the OpenF1 API.
      </Text>

      <Box mt={50}>
        {loading && (
          <Stack align="center" justify="center" py={60}>
            <Loader size="xl" color="red" />
            <Text c="dimmed" size="sm">
              Loading F1 driver lineup...
            </Text>
          </Stack>
        )}

        {error && (
          <Alert color="red" title="Unable to load drivers" mt="xl">
            {error}
          </Alert>
        )}

        {!loading && !error && drivers.length === 0 && (
          <Text ta="center" c="dimmed" py={40}>
            No drivers found for this session.
          </Text>
        )}

        {!loading && !error && drivers.length > 0 && (
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="lg">
            {drivers.map((driver) => {
              const teamColor = driver.team_colour
                ? `#${driver.team_colour}`
                : '#e03131';

              return (
                <Card
                  key={driver.driver_number}
                  shadow="sm"
                  padding="lg"
                  radius="md"
                  withBorder
                  style={{
                    borderTop: `4px solid ${teamColor}`,
                    transition: 'transform 150ms ease, box-shadow 150ms ease',
                  }}
                >
                  <Group justify="space-between" mb="xs">
                    <Badge color="dark" variant="filled" size="lg">
                      #{driver.driver_number}
                    </Badge>
                    {driver.country_code && (
                      <Badge variant="light" color="gray">
                        {driver.country_code}
                      </Badge>
                    )}
                  </Group>

                  <Group align="center" gap="md" my="sm">
                    <Avatar
                      src={driver.headshot_url}
                      alt={driver.full_name}
                      size="xl"
                      radius="xl"
                      color="red"
                    >
                      {driver.name_acronym || driver.driver_number}
                    </Avatar>

                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <Text fw={700} size="md" truncate>
                        {driver.full_name}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {driver.broadcast_name}
                      </Text>
                    </Box>
                  </Group>

                  <Group justify="space-between" mt="md">
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
        )}
      </Box>
    </Container>
  );
}

