import React from 'react';
import { Box, Text, SimpleGrid, Card, Group, Badge } from '@mantine/core';
import { Meeting } from '../../lib/middleware';
import classes from './RaceExplorer.module.css';

export interface MeetingGridProps {
  meetings: Meeting[];
  selectedMeetingKey: number | null;
  onSelectMeeting: (meetingKey: number) => void;
}

export function MeetingGrid({ meetings, selectedMeetingKey, onSelectMeeting }: MeetingGridProps) {
  return (
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
              onClick={() => onSelectMeeting(meeting.meeting_key)}
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
  );
}
