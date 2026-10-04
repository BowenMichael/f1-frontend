import { render, screen } from '../../test-utils';
import { DeploymentBadge } from './DeploymentBadge';

describe('DeploymentBadge', () => {
  it('renders a link to the live deployment with correct attributes', () => {
    render(<DeploymentBadge />);

    // Find the link (Anchor) by its role
    const link = screen.getByRole('link', { name: /Live Deployment/i });

    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://f1-frontend.vercel.app');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
