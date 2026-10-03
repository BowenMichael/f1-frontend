import { render, screen } from '@/test-utils';
import { Welcome } from './Welcome';

describe('Welcome component', () => {
  it('renders the F1 Viewer title and description', () => {
    render(<Welcome />);
    expect(screen.getByText('F1 Viewer')).toBeInTheDocument();
    expect(screen.getByText(/Explore 2023 Formula 1 session drivers/i)).toBeInTheDocument();
  });
});
