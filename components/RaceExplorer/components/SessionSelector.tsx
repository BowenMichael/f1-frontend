import React from 'react';
import { Box, Text, SegmentedControl, Paper } from '@mantine/core';
import { Session } from '../../../lib/middleware';

interface SessionSelectorProps {
  sessions: Session[];
  selectedSessionKey: number | null;
  onSelectSession: (sessionKey: number) => void;
}

export function SessionSelector({
  sessions,
  selectedSessionKey,
  onSelectSession,
}: SessionSelectorProps) {
  if (sessions.length === 0) {
    return (
      <Paper p="md" withBorder radius="md" ta="center" mt="xs">
        <Text size="sm" c="dimmed">
          No sessions scheduled or recorded yet for this meeting.
        </Text>
      </Paper>
    );
  }

  return (
    <Box mt="xs">
      <Text fw={600} size="sm" mb="xs">
        Choose Session:
      </Text>
      <SegmentedControl
        value={selectedSessionKey ? selectedSessionKey.toString() : ''}
        onChange={(val) => onSelectSession(parseInt(val, 10))}
        data={sessions.map((s) => ({
          label: s.session_name,
          value: s.session_key.toString(),
        }))}
        color="red"
        size="md"
        radius="xl"
      />
    </Box>
  );
}
