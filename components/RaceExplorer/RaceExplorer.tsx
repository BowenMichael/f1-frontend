import React, { useMemo } from 'react';
import {
  Title,
  Text,
  Container,
  Badge,
  Group,
  Loader,
  Alert,
  Stack,
  Box,
  Select,
  Paper,
  Divider,
} from '@mantine/core';
import { getAvailableSeasons } from '../../utils/seasons';
import { useF1Data } from './hooks/useF1Data';
import { MeetingGrid } from './components/MeetingGrid';
import { SessionSelector } from './components/SessionSelector';
import { DriverGrid } from './components/DriverGrid';
import classes from './RaceExplorer.module.css';

export function RaceExplorer() {
  const seasons = useMemo(() => getAvailableSeasons(), []);
  const {
    selectedSeason,
    setSelectedSeason,
    meetings,
    loadingMeetings,
    meetingsError,
    selectedMeetingKey,
    setSelectedMeetingKey,
    selectedMeeting,
    sessions,
    loadingSessions,
    sessionsError,
    selectedSessionKey,
    setSelectedSessionKey,
    drivers,
    loadingDrivers,
    driversError,
  } = useF1Data();

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <Box>
          <Title className={classes.title} ta="center" mt={20}>
            F1 Historical Calendar & Race Explorer
          </Title>
          <Text c="dimmed" ta="center" size="lg" maw={700} mx="auto" mt="xs">
            Browse Formula 1 championship seasons up to the current day, select Grand Prix meetings,
            and explore session lineups.
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
                data={seasons}
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
          <MeetingGrid
            meetings={meetings}
            selectedMeetingKey={selectedMeetingKey}
            onSelectMeeting={setSelectedMeetingKey}
            season={selectedSeason}
          />
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
              {!loadingSessions && !sessionsError && (
                <SessionSelector
                  sessions={sessions}
                  selectedSessionKey={selectedSessionKey}
                  onSelectSession={setSelectedSessionKey}
                />
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

              {!loadingDrivers && !driversError && <DriverGrid drivers={drivers} />}
            </Box>
          </Stack>
        )}
      </Stack>
    </Container>
  );
}
