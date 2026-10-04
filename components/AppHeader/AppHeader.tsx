import { Group, Container } from '@mantine/core';
import { DeploymentBadge } from '../DeploymentBadge/DeploymentBadge';
import { ColorSchemeToggle } from '../ColorSchemeToggle/ColorSchemeToggle';
import { PatchNotesButton } from '../PatchNotes';

export function AppHeader() {
  return (
    <Container size="lg">
      <Group justify="space-between" py="md">
        <DeploymentBadge />
        <Group gap="sm">
          <PatchNotesButton />
          <ColorSchemeToggle />
        </Group>
      </Group>
    </Container>
  );
}
