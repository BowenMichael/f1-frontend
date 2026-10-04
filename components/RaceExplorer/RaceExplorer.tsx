import React, { useEffect, useState } from 'react';
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
  Select,
  SegmentedControl,
  Paper,
  Divider,
} from '@mantine/core';
import {
  GETMeetings,
  GETSessions,
  GETDrivers,
  Meeting,
  Session,
  Driver,
} from '../../lib/middleware';
import classes from './RaceExplorer.module.css';

const SEASONS = ['2024', '2023'];

export function RaceExplorer() {
  const [selectedSeason, setSelectedSeason] = useState<string>('2023');
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loadingMeetings, setLoadingMeetings] = useState<boolean>(false);
  const [meetingsError, setMeetingsError] = useState<string | null>(null);

  const [selectedMeetingKey, setSelectedMeetingKey] = useState<number | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loadingSessions, setLoadingSessions] = useState<boolean>(false);
  const [sessionsError, setSessionsError] = useState<string | null>(null);

  const [selectedSessionKey, setSelectedSessionKey] = useState<number | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loadingDrivers, setLoadingDrivers] = useState<boolean>(false);
  const [driversError, setDriversError] = useState<string | null>(null);

  // Fetch meetings when selected season changes
  useEffect(() => {
    let isMounted = true;
    setLoadingMeetings(true);
    setMeetingsError(null);
    setSelectedMeetingKey(null);
    setSessions([]);
    setSelectedSessionKey(null);
    setDrivers([]);

    const yearNum = parseInt(selectedSeason, 10);
    GETMeetings(yearNum)
      .then((data) => {
        if (!isMounted) return;
        setMeetings(data);
        if (data.length > 0) {
          setSelectedMeetingKey(data[0].meeting_key);
        }
        setLoadingMeetings(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        setMeetingsError(err instanceof Error ? err.message : 'Failed to fetch meetings');
        setLoadingMeetings(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedSeason]);

  // Fetch sessions when selected meeting changes
  useEffect(() => {
    let isMounted = true;

    if (!selectedMeetingKey) {
      setSessions([]);
      setSelectedSessionKey(null);
    } else {
      setLoadingSessions(true);
      setSessionsError(null);
      setSelectedSessionKey(null);
      setDrivers([]);

      GETSessions(undefined, undefined, undefined, selectedMeetingKey)
        .then((data) => {
          if (!isMounted) return;
          setSessions(data);
          if (data.length > 0) {
            // Default to Race session if available, else first session
            const raceSession = data.find(
              (s) =>
                s.session_name.toLowerCase().includes('race') &&
                !s.session_name.toLowerCase().includes('sprint')
            );
            setSelectedSessionKey(raceSession ? raceSession.session_key : data[0].session_key);
          }
          setLoadingSessions(false);
        })
        .catch((err) => {
          if (!isMounted) return;
          setSessionsError(err instanceof Error ? err.message : 'Failed to fetch sessions');
          setLoadingSessions(false);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [selectedMeetingKey]);

  // Fetch drivers when selected session changes
  useEffect(() => {
    let isMounted = true;

    if (!selectedSessionKey) {
      setDrivers([]);
    } else {
      setLoadingDrivers(true);
      setDriversError(null);

      GETDrivers(undefined, selectedSessionKey)
        .then((data) => {
          if (!isMounted) return;
          const uniqueDrivers = Array.from(new Map(data.map((d) => [d.driver_number, d])).values());
          setDrivers(uniqueDrivers);
          setLoadingDrivers(false);
        })
        .catch((err) => {
          if (!isMounted) return;
          setDriversError(err instanceof Error ? err.message : 'Failed to fetch drivers');
          setLoadingDrivers(false);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [selectedSessionKey]);

  const selectedMeeting = meetings.find((m) => m.meeting_key === selectedMeetingKey);

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <Box>
          <Title className={classes.title} ta="center" mt={20}>
            F1 Historical Calendar & Race Explorer
          </Title>
          <Text c="dimmed" ta="center" size="lg" maw={700} mx="auto" mt="xs">
            Browse past Formula 1 seasons, select Grand Prix meetings, and explore session lineups.
          </Text>
        </Box>

        {/* Season Filter Bar */}
        <Paper p="md" radius="md" withBorder shadow="xs">
          <Group justify="space-between" align="center">
            <Group>
              <Text fw={600} size="sm">
                Select Championship Season:
              </Text>
              <Select
                aria-label="Select Championship Season"
                data={SEASONS}
                value={selectedSeason}
                onChange={(val) => val && setSelectedSeason(val)}
                allowDeselect={false}
                w={140}
              />
            </Group>

            {selectedMeeting && (
              <Badge size="lg" variant="light" color="red">
                {selectedMeeting.meeting_name} ({selectedSeason})
              </Badge>
            )}
          </Group>
        </Paper>

        {/* Meeting Loading & Error States */}
        {loadingMeetings && (
          <Stack align="center" justify="center" py={40}>
            <Loader size="lg" color="red" />
            <Text c="dimmed" size="sm">
              Loading {selectedSeason} Grand Prix calendar...
            </Text>
          </Stack>
        )}

        {meetingsError && (
          <Alert color="red" title="Error loading calendar">
            {meetingsError}
          </Alert>
        )}

        {/* Meetings Grid / List */}
        {!loadingMeetings && !meetingsError && (
          <Box>
            <Text fw={700} size="md" mb="sm">
              Grand Prix Calendar ({meetings.length} Rounds)
            </Text>
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="md">
              {meetings.map((meeting) => {
                const isSelected = meeting.meeting_key === selectedMeetingKey;
                return (
                  <Card
                    key={meeting.meeting_key}
                    shadow="xs"
                    p="md"
                    radius="md"
                    withBorder
                    className={classes.meetingCard}
                    style={{
                      borderColor: isSelected ? 'var(--mantine-color-red-filled)' : undefined,
                      borderWidth: isSelected ? '2px' : '1px',
                      backgroundColor: isSelected
                        ? 'light-dark(var(--mantine-color-red-0), rgba(224, 49, 49, 0.1))'
                        : undefined,
                    }}
                    onClick={() => setSelectedMeetingKey(meeting.meeting_key)}
                    data-testid={`meeting-card-${meeting.meeting_key}`}
                  >
                    <Group justify="space-between" mb={6}>
                      <Badge variant={isSelected ? 'filled' : 'light'} color="red">
                        {meeting.country_code || 'GP'}
                      </Badge>
                      <Text size="xs" c="dimmed">
                        {meeting.circuit_short_name}
                      </Text>
                    </Group>
                    <Text fw={700} size="sm" lineClamp={1}>
                      {meeting.meeting_name}
                    </Text>
                    <Text size="xs" c="dimmed" mt={4}>
                      {meeting.location}
                    </Text>
                  </Card>
                );
              })}
            </SimpleGrid>
          </Box>
        )}

        <Divider my="sm" />

        {/* Session Selector & Driver Lineup Section */}
        {selectedMeeting && (
          <Stack gap="lg">
            <Box>
              <Group justify="space-between" align="center" mb="sm">
                <div>
                  <Title order={3}>{selectedMeeting.meeting_name}</Title>
                  <Text size="sm" c="dimmed">
                    {selectedMeeting.location} • {selectedMeeting.circuit_short_name}
                  </Text>
                </div>
              </Group>

              {/* Sessions Loader / Error */}
              {loadingSessions && (
                <Stack align="center" py={20}>
                  <Loader size="md" color="red" />
                  <Text size="xs" c="dimmed">
                    Loading sessions...
                  </Text>
                </Stack>
              )}

              {sessionsError && (
                <Alert color="red" title="Error loading sessions">
                  {sessionsError}
                </Alert>
              )}

              {/* Session Selector Pills */}
              {!loadingSessions && !sessionsError && sessions.length > 0 && (
                <Box mt="xs">
                  <Text fw={600} size="sm" mb="xs">
                    Choose Session:
                  </Text>
                  <SegmentedControl
                    value={selectedSessionKey ? selectedSessionKey.toString() : ''}
                    onChange={(val) => setSelectedSessionKey(parseInt(val, 10))}
                    data={sessions.map((s) => ({
                      label: s.session_name,
                      value: s.session_key.toString(),
                    }))}
                    color="red"
                    size="md"
                    radius="xl"
                  />
                </Box>
              )}
            </Box>

            {/* Drivers Section */}
            <Box>
              <Group justify="space-between" align="center" mb="md">
                <Text fw={700} size="md">
                  Participating Drivers Lineup
                </Text>
                {selectedSessionKey && !loadingDrivers && (
                  <Badge variant="outline" color="gray">
                    {drivers.length} Drivers
                  </Badge>
                )}
              </Group>

              {loadingDrivers && (
                <Stack align="center" justify="center" py={50}>
                  <Loader size="lg" color="red" />
                  <Text c="dimmed" size="sm">
                    Loading session driver lineup...
                  </Text>
                </Stack>
              )}

              {driversError && (
                <Alert color="red" title="Unable to load drivers">
                  {driversError}
                </Alert>
              )}

              {!loadingDrivers && !driversError && drivers.length === 0 && (
                <Paper p="xl" withBorder radius="md" ta="center">
                  <Text c="dimmed">No driver records found for this session.</Text>
                </Paper>
              )}

              {!loadingDrivers && !driversError && drivers.length > 0 && (
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
              )}
            </Box>
          </Stack>
        )}
      </Stack>
    </Container>
  );
}
