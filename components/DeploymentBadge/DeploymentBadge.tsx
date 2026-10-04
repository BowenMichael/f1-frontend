import { Badge, Anchor } from '@mantine/core';

export function DeploymentBadge() {
  return (
    <Anchor
      href="https://f1-frontend.vercel.app"
      target="_blank"
      rel="noopener noreferrer"
      style={{ textDecoration: 'none' }}
    >
      <Badge color="green" variant="light" size="lg" radius="md">
        🟢 Live Deployment
      </Badge>
    </Anchor>
  );
}
