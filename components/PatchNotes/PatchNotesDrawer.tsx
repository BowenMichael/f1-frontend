import React from 'react';
import {
  Drawer,
  Stack,
  Title,
  Text,
  Badge,
  Group,
  List,
  ThemeIcon,
  Divider,
  ScrollArea,
} from '@mantine/core';
import { IconSparkles, IconBug, IconRocket } from '@tabler/icons-react';
import { PATCH_NOTES, PatchNoteItem } from '../../data/patchNotes';

interface PatchNotesDrawerProps {
  opened: boolean;
  onClose: () => void;
}

function getBadgeProps(type: PatchNoteItem['type']) {
  switch (type) {
    case 'feature':
      return { color: 'blue', label: 'Feature', icon: <IconSparkles size={14} /> };
    case 'fix':
      return { color: 'red', label: 'Fix', icon: <IconBug size={14} /> };
    case 'improvement':
    default:
      return { color: 'teal', label: 'Improvement', icon: <IconRocket size={14} /> };
  }
}

export function PatchNotesDrawer({ opened, onClose }: PatchNotesDrawerProps) {
  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          <IconSparkles size={20} color="var(--mantine-color-blue-filled)" />
          <Title order={3}>Patch Notes & Updates</Title>
        </Group>
      }
      position="right"
      size="md"
      scrollAreaComponent={ScrollArea.Autosize}
    >
      <Stack gap="xl" py="sm">
        {PATCH_NOTES.map((release, index) => (
          <Stack key={release.version} gap="xs">
            <Group justify="space-between" align="center">
              <Group gap="xs">
                <Text fw={700} size="lg">
                  {release.version}
                </Text>
                {release.isLatest && (
                  <Badge color="green" variant="filled" size="sm">
                    Current Version
                  </Badge>
                )}
              </Group>
              <Text size="xs" c="dimmed">
                {release.releaseDate}
              </Text>
            </Group>

            <Text size="sm" c="dimmed">
              {release.highlights}
            </Text>

            <List spacing="xs" size="sm" mt="xs">
              {release.changes.map((item, idx) => {
                const badge = getBadgeProps(item.type);
                return (
                  <List.Item
                    key={idx}
                    icon={
                      <ThemeIcon color={badge.color} size={20} radius="xl">
                        {badge.icon}
                      </ThemeIcon>
                    }
                  >
                    <Group gap="xs" align="center" wrap="nowrap">
                      <Badge size="xs" variant="light" color={badge.color}>
                        {badge.label}
                      </Badge>
                      <Text size="sm">{item.description}</Text>
                    </Group>
                  </List.Item>
                );
              })}
            </List>

            {index < PATCH_NOTES.length - 1 && <Divider mt="md" />}
          </Stack>
        ))}
      </Stack>
    </Drawer>
  );
}
