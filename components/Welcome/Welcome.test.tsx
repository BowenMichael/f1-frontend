import { render, screen, waitFor } from '@/test-utils';
import { Welcome } from './Welcome';
import * as middleware from '../../lib/middleware';

jest.mock('../../lib/middleware', () => ({
  GETDrivers: jest.fn(),
}));

describe('Welcome component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders welcome heading and driver loading state', async () => {
    (middleware.GETDrivers as jest.Mock).mockResolvedValue([]);
    render(<Welcome />);
    expect(screen.getByText('F1 Viewer')).toBeInTheDocument();
    expect(screen.getByText(/Explore 2023 Formula 1 session drivers/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(middleware.GETDrivers).toHaveBeenCalled();
    });
  });
});
