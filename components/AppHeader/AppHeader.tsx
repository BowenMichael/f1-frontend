import { Group, Container } from '@mantine/core';
import { DeploymentBadge } from '../DeploymentBadge/DeploymentBadge';
import { ColorSchemeToggle } from '../ColorSchemeToggle/ColorSchemeToggle';

export function AppHeader() {
  return (
    <Container size="lg">
      <Group justify="space-between" py="md">
        <DeploymentBadge />
        <ColorSchemeToggle />
      </Group>
    </Container>
  );
}
