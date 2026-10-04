import React from 'react';
import { Group, ActionIcon, Slider, SegmentedControl, Text, Paper, Stack } from '@mantine/core';
import { IconPlayerPlay, IconPlayerPause, IconRotateClockwise2 } from '@tabler/icons-react';
import { PlaybackSpeed } from '../../lib/types/replay';

export interface ReplayControlsProps {
  isPlaying: boolean;
  speed: PlaybackSpeed;
  currentTime: number;
  startTime: number;
  endTime: number;
  onTogglePlay: () => void;
  onSpeedChange: (speed: PlaybackSpeed) => void;
  onSeek: (time: number) => void;
  onReset: () => void;
}

function ReplayControlsComponent({
  isPlaying,
  speed,
  currentTime,
  startTime,
  endTime,
  onTogglePlay,
  onSpeedChange,
  onSeek,
  onReset,
}: ReplayControlsProps) {
  const formatTime = (ms: number) => {
    if (!ms || Number.isNaN(ms)) return '00:00.0';
    const date = new Date(ms);
    const min = date.getUTCMinutes().toString().padStart(2, '0');
    const sec = date.getUTCSeconds().toString().padStart(2, '0');
    const tenths = Math.floor(date.getUTCMilliseconds() / 100);
    return `${min}:${sec}.${tenths}`;
  };

  const progressElapsed = Math.max(0, currentTime - startTime);
  const totalDuration = Math.max(1, endTime - startTime);

  return (
    <Paper withBorder p="md" radius="md" bg="dark.8">
      <Stack gap="sm">
        {/* Timeline Scrubber */}
        <Group justify="space-between">
          <Text size="xs" fw={700} c="dimmed">
            {formatTime(progressElapsed)}
          </Text>
          <Text size="xs" fw={700} c="dimmed">
            {formatTime(totalDuration)}
          </Text>
        </Group>

        <Slider
          value={currentTime}
          min={startTime}
          max={endTime}
          step={50}
          label={(val) => formatTime(val - startTime)}
          onChange={onSeek}
          color="red"
          size="md"
          radius="xl"
          styles={{
            thumb: { borderWidth: 2, borderColor: '#fff' },
            track: { cursor: 'pointer' },
          }}
        />

        {/* Action Controls */}
        <Group justify="space-between" align="center" mt="xs">
          <Group gap="sm">
            <ActionIcon
              size="lg"
              radius="xl"
              variant="filled"
              color={isPlaying ? 'yellow' : 'red'}
              onClick={onTogglePlay}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <IconPlayerPause size="1.2rem" /> : <IconPlayerPlay size="1.2rem" />}
            </ActionIcon>

            <ActionIcon
              size="lg"
              radius="xl"
              variant="light"
              color="gray"
              onClick={onReset}
              aria-label="Restart Replay"
            >
              <IconRotateClockwise2 size="1.2rem" />
            </ActionIcon>
          </Group>

          <Group gap="xs" align="center">
            <Text size="xs" fw={700} c="dimmed">
              SPEED:
            </Text>
            <SegmentedControl
              size="xs"
              radius="md"
              value={speed.toString()}
              onChange={(val) => onSpeedChange(Number(val) as PlaybackSpeed)}
              data={[
                { label: '1x', value: '1' },
                { label: '2x', value: '2' },
                { label: '5x', value: '5' },
                { label: '10x', value: '10' },
              ]}
            />
          </Group>
        </Group>
      </Stack>
    </Paper>
  );
}

export const ReplayControls = React.memo(ReplayControlsComponent);
