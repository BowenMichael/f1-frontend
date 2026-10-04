import { render, screen } from '@/test-utils';
import { Welcome } from './Welcome';

describe('Welcome component', () => {
  it('renders welcome heading and loading state', () => {
    render(<Welcome />);
    expect(screen.getByText('F1 Viewer')).toBeInTheDocument();
    expect(screen.getByText(/Loading F1 driver lineup/i)).toBeInTheDocument();
  });
});
