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
import { SessionDashboard } from './SessionDashboard';
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


  // Fetch meetings when selected season changes
  useEffect(() => {
    let isMounted = true;
    setLoadingMeetings(true);
    setMeetingsError(null);
    setSelectedMeetingKey(null);
    setSessions([]);
    setSelectedSessionKey(null);


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

            {/* Session Dashboard Section */}
            {selectedSessionKey && (
              <SessionDashboard sessionKey={selectedSessionKey} />
            )}
          </Stack>
        )}
      </Stack>
    </Container>
  );
}
