import React, { useState } from 'react';
import { Button, Badge, Group } from '@mantine/core';
import { IconSparkles } from '@tabler/icons-react';
import { PatchNotesDrawer } from './PatchNotesDrawer';
import { PATCH_NOTES } from '../../data/patchNotes';

export function PatchNotesButton() {
  const [opened, setOpened] = useState(false);
  const latestRelease = PATCH_NOTES.find((r) => r.isLatest) || PATCH_NOTES[0];

  return (
    <>
      <Button
        variant="subtle"
        color="gray"
        size="compact-sm"
        onClick={() => setOpened(true)}
        leftSection={<IconSparkles size={16} />}
        aria-label="Open Patch Notes"
        data-testid="patch-notes-button"
      >
        <Group gap={6} align="center">
          <span>What&apos;s New</span>
          {latestRelease && (
            <Badge size="xs" variant="light" color="blue">
              {latestRelease.version}
            </Badge>
          )}
        </Group>
      </Button>

      <PatchNotesDrawer opened={opened} onClose={() => setOpened(false)} />
    </>
  );
}
