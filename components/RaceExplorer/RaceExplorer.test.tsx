import { render, screen, waitFor, fireEvent } from '@/test-utils';
import { RaceExplorer } from './RaceExplorer';
import * as middleware from '../../lib/middleware';

jest.mock('../../lib/middleware', () => ({
  GETMeetings: jest.fn(),
  GETSessions: jest.fn(),
  GETDrivers: jest.fn(),
  GETLaps: jest.fn().mockResolvedValue([]),
  GETIntervals: jest.fn().mockResolvedValue([]),
  GETStints: jest.fn().mockResolvedValue([]),
}));

jest.mock('../../utils/seasons', () => {
  const actual = jest.requireActual('../../utils/seasons');
  return {
    ...actual,
    getDefaultSeason: jest.fn(() => '2026'),
    getAvailableSeasons: jest.fn(() => ['2026', '2025', '2024', '2023']),
  };
});

const mockMeetings = [
  {
    meeting_key: 1200,
    meeting_name: 'Bahrain Grand Prix',
    meeting_official_name: 'FORMULA 1 GULF AIR BAHRAIN GRAND PRIX 2026',
    location: 'Sakhir',
    country_key: 1,
    country_code: 'BRN',
    country_name: 'Bahrain',
    circuit_key: 1,
    circuit_short_name: 'Sakhir',
    gmt_offset: '03:00:00',
    date_start: '2026-03-03T11:30:00+00:00',
    date_end: '2026-03-05T15:00:00+00:00',
    year: 2026,
  },
  {
    meeting_key: 1201,
    meeting_name: 'Saudi Arabian Grand Prix',
    meeting_official_name: 'FORMULA 1 STC SAUDI ARABIAN GRAND PRIX 2026',
    location: 'Jeddah',
    country_key: 2,
    country_code: 'KSA',
    country_name: 'Saudi Arabia',
    circuit_key: 2,
    circuit_short_name: 'Jeddah',
    gmt_offset: '03:00:00',
    date_start: '2026-03-17T13:30:00+00:00',
    date_end: '2026-03-19T17:00:00+00:00',
    year: 2026,
  },
];

const mockSessions = [
  {
    session_key: 9001,
    session_name: 'Practice 1',
    date_start: '2026-03-03T11:30:00+00:00',
    date_end: '2026-03-03T12:30:00+00:00',
    gmt_offset: '03:00:00',
    session_type: 'Practice',
    meeting_key: 1200,
    location: 'Sakhir',
    country_key: 1,
    country_code: 'BRN',
    country_name: 'Bahrain',
    circuit_key: 1,
    circuit_short_name: 'Sakhir',
    year: 2026,
  },
  {
    session_key: 9002,
    session_name: 'Qualifying',
    date_start: '2026-03-04T15:00:00+00:00',
    date_end: '2026-03-04T16:00:00+00:00',
    gmt_offset: '03:00:00',
    session_type: 'Qualifying',
    meeting_key: 1200,
    location: 'Sakhir',
    country_key: 1,
    country_code: 'BRN',
    country_name: 'Bahrain',
    circuit_key: 1,
    circuit_short_name: 'Sakhir',
    year: 2026,
  },
  {
    session_key: 9003,
    session_name: 'Race',
    date_start: '2026-03-05T15:00:00+00:00',
    date_end: '2026-03-05T17:00:00+00:00',
    gmt_offset: '03:00:00',
    session_type: 'Race',
    meeting_key: 1200,
    location: 'Sakhir',
    country_key: 1,
    country_code: 'BRN',
    country_name: 'Bahrain',
    circuit_key: 1,
    circuit_short_name: 'Sakhir',
    year: 2026,
  },
];

const mockDrivers = [
  {
    broadcast_name: 'M VERSTAPPEN',
    country_code: 'NED',
    driver_number: 1,
    first_name: 'Max',
    full_name: 'Max VERSTAPPEN',
    headshot_url: 'https://example.com/ver.png',
    last_name: 'Verstappen',
    meeting_key: 1200,
    name_acronym: 'VER',
    session_key: 9003,
    team_colour: '3671C6',
    team_name: 'Red Bull Racing',
  },
  {
    broadcast_name: 'L HAMILTON',
    country_code: 'GBR',
    driver_number: 44,
    first_name: 'Lewis',
    full_name: 'Lewis HAMILTON',
    headshot_url: 'https://example.com/ham.png',
    last_name: 'Hamilton',
    meeting_key: 1200,
    name_acronym: 'HAM',
    session_key: 9003,
    team_colour: '6CD3BF',
    team_name: 'Ferrari',
  },
];

describe('RaceExplorer component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (middleware.GETMeetings as jest.Mock).mockResolvedValue(mockMeetings);
    (middleware.GETSessions as jest.Mock).mockResolvedValue(mockSessions);
    (middleware.GETDrivers as jest.Mock).mockResolvedValue(mockDrivers);
    (middleware.GETLaps as jest.Mock).mockResolvedValue([]);
    (middleware.GETIntervals as jest.Mock).mockResolvedValue([]);
    (middleware.GETStints as jest.Mock).mockResolvedValue([]);
  });

  it('renders title and loads meetings for default season', async () => {
    render(<RaceExplorer />);

    expect(screen.getByText('F1 Historical Calendar & Race Explorer')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getAllByText(/Bahrain Grand Prix/).length).toBeGreaterThan(0);
    });
    expect(screen.getByText('Saudi Arabian Grand Prix')).toBeInTheDocument();

    expect(middleware.GETMeetings).toHaveBeenCalledWith(2026);
  });

  it('loads sessions and drivers when meeting is selected', async () => {
    render(<RaceExplorer />);

    await waitFor(() => {
      expect(screen.getAllByText(/Bahrain Grand Prix/).length).toBeGreaterThan(0);
    });

    await waitFor(() => {
      expect(screen.getByText('Max VERSTAPPEN')).toBeInTheDocument();
    });
    expect(screen.getByText('Lewis HAMILTON')).toBeInTheDocument();

    expect(screen.getByText('Red Bull Racing')).toBeInTheDocument();
    expect(screen.getByText('Ferrari')).toBeInTheDocument();
  });

  it('allows switching sessions and re-fetches drivers', async () => {
    render(<RaceExplorer />);

    await waitFor(() => {
      expect(screen.getByText('Qualifying')).toBeInTheDocument();
    });

    (middleware.GETDrivers as jest.Mock).mockResolvedValue([mockDrivers[0]]);

    fireEvent.click(screen.getByText('Qualifying'));

    await waitFor(() => {
      expect(middleware.GETDrivers).toHaveBeenCalledWith(undefined, 9002);
    });
  });

  it('handles error state gracefully', async () => {
    (middleware.GETMeetings as jest.Mock).mockImplementationOnce(() =>
      Promise.reject(new Error('Network error'))
    );
    render(<RaceExplorer />);

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('handles empty sessions and drivers gracefully for future/pending events', async () => {
    (middleware.GETSessions as jest.Mock).mockResolvedValue([]);
    (middleware.GETDrivers as jest.Mock).mockResolvedValue([]);

    render(<RaceExplorer />);

    await waitFor(() => {
      expect(screen.getAllByText(/Bahrain Grand Prix/).length).toBeGreaterThan(0);
    });

    await waitFor(() => {
      expect(
        screen.getByText('No sessions scheduled or recorded yet for this meeting.')
      ).toBeInTheDocument();
    });
  });
});
