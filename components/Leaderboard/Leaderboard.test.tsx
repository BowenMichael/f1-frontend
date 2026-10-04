import { render, screen } from '@/test-utils';
import { Leaderboard, formatLapTime, formatGap, getTyreBadgeProps } from './Leaderboard';
import { Driver, Lap, Interval, Stint } from '../../lib/middleware';

const mockDrivers: Driver[] = [
  {
    broadcast_name: 'M VERSTAPPEN',
    country_code: 'NED',
    driver_number: 1,
    first_name: 'Max',
    full_name: 'Max Verstappen',
    headshot_url: 'https://example.com/max.png',
    last_name: 'Verstappen',
    meeting_key: 1216,
    name_acronym: 'VER',
    session_key: 9141,
    team_colour: '3671C6',
    team_name: 'Red Bull Racing',
  },
  {
    broadcast_name: 'S PEREZ',
    country_code: 'MEX',
    driver_number: 11,
    first_name: 'Sergio',
    full_name: 'Sergio Perez',
    headshot_url: 'https://example.com/perez.png',
    last_name: 'Perez',
    meeting_key: 1216,
    name_acronym: 'PER',
    session_key: 9141,
    team_colour: '3671C6',
    team_name: 'Red Bull Racing',
  },
  {
    broadcast_name: 'C LECLERC',
    country_code: 'MON',
    driver_number: 16,
    first_name: 'Charles',
    full_name: 'Charles Leclerc',
    headshot_url: null,
    last_name: 'Leclerc',
    meeting_key: 1216,
    name_acronym: 'LEC',
    session_key: 9141,
    team_colour: 'F80000',
    team_name: 'Ferrari',
  },
];

const mockLaps: Lap[] = [
  {
    meeting_key: 1216,
    session_key: 9141,
    driver_number: 1,
    lap_number: 10,
    date_start: null,
    lap_duration: 108.456,
  },
  {
    meeting_key: 1216,
    session_key: 9141,
    driver_number: 1,
    lap_number: 11,
    date_start: null,
    lap_duration: 106.123, // best lap
  },
  {
    meeting_key: 1216,
    session_key: 9141,
    driver_number: 11,
    lap_number: 12,
    date_start: null,
    lap_duration: 107.5,
  },
  {
    meeting_key: 1216,
    session_key: 9141,
    driver_number: 16,
    lap_number: 15,
    date_start: null,
    lap_duration: 107.89,
  },
];

const mockIntervals: Interval[] = [
  {
    date: '2023-07-30T14:20:00Z',
    session_key: 9141,
    meeting_key: 1216,
    driver_number: 1,
    gap_to_leader: 0,
    interval: 0,
  },
  {
    date: '2023-07-30T14:20:00Z',
    session_key: 9141,
    meeting_key: 1216,
    driver_number: 11,
    gap_to_leader: 22.305,
    interval: 22.305,
  },
  {
    date: '2023-07-30T14:20:00Z',
    session_key: 9141,
    meeting_key: 1216,
    driver_number: 16,
    gap_to_leader: 32.259,
    interval: 9.954,
  },
];

const mockStints: Stint[] = [
  {
    meeting_key: 1216,
    session_key: 9141,
    stint_number: 2,
    driver_number: 1,
    lap_start: 15,
    lap_end: 44,
    compound: 'MEDIUM',
    tyre_age_at_start: 0,
  },
  {
    meeting_key: 1216,
    session_key: 9141,
    stint_number: 3,
    driver_number: 1,
    lap_start: 45,
    lap_end: 58,
    compound: 'SOFT',
    tyre_age_at_start: 0,
  },
  {
    meeting_key: 1216,
    session_key: 9141,
    stint_number: 1,
    driver_number: 11,
    lap_start: 1,
    lap_end: 25,
    compound: 'HARD',
    tyre_age_at_start: 0,
  },
];

describe('Leaderboard Component', () => {
  it('renders loading skeleton state correctly', () => {
    render(<Leaderboard drivers={[]} laps={[]} loading />);
    expect(screen.getByTestId('leaderboard-loading')).toBeInTheDocument();
  });

  it('renders empty state when no data exists', () => {
    render(<Leaderboard drivers={[]} laps={[]} loading={false} />);
    expect(screen.getByTestId('leaderboard-empty')).toBeInTheDocument();
    expect(screen.getByText('No timing data available for this session')).toBeInTheDocument();
  });

  it('renders error state when error message provided', () => {
    render(<Leaderboard drivers={[]} laps={[]} error="Failed to fetch intervals" />);
    expect(screen.getByTestId('leaderboard-error')).toBeInTheDocument();
    expect(screen.getByText('Failed to fetch intervals')).toBeInTheDocument();
  });

  it('renders leaderboard table with drivers, positions, intervals, and tyre badges', () => {
    render(
      <Leaderboard
        drivers={mockDrivers}
        laps={mockLaps}
        intervals={mockIntervals}
        stints={mockStints}
      />
    );

    expect(screen.getByTestId('leaderboard-table')).toBeInTheDocument();

    // Check positions and drivers
    expect(screen.getByText('Max Verstappen')).toBeInTheDocument();
    expect(screen.getByText('Sergio Perez')).toBeInTheDocument();
    expect(screen.getByText('Charles Leclerc')).toBeInTheDocument();

    // Check tyre compound badges
    expect(screen.getByText('SOFT')).toBeInTheDocument();
    expect(screen.getByText('HARD')).toBeInTheDocument();

    // Check intervals & gaps
    expect(screen.getByText('LEADER')).toBeInTheDocument();
    expect(screen.getAllByText('+22.305s').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('+32.259s')).toBeInTheDocument();
    expect(screen.getByText('+9.954s')).toBeInTheDocument();

    // Check best lap formatted
    expect(screen.getByText('1:46.123')).toBeInTheDocument(); // 106.123s
    expect(screen.getByText('FL')).toBeInTheDocument(); // Fastest lap badge
  });

  describe('helper formatters', () => {
    it('formatLapTime handles valid and invalid inputs', () => {
      expect(formatLapTime(null)).toBe('—');
      expect(formatLapTime(undefined)).toBe('—');
      expect(formatLapTime(0)).toBe('—');
      expect(formatLapTime(45.678)).toBe('45.678s');
      expect(formatLapTime(92.594)).toBe('1:32.594');
    });

    it('formatGap handles leader and relative gaps', () => {
      expect(formatGap(0, true)).toBe('LEADER');
      expect(formatGap(5.234, false)).toBe('+5.234s');
      expect(formatGap('1 LAP', false)).toBe('1 LAP');
      expect(formatGap(null, false)).toBe('—');
    });

    it('getTyreBadgeProps returns appropriate colours', () => {
      expect(getTyreBadgeProps('SOFT').color).toBe('red');
      expect(getTyreBadgeProps('MEDIUM').color).toBe('yellow');
      expect(getTyreBadgeProps('HARD').color).toBe('gray');
      expect(getTyreBadgeProps('INTERMEDIATE').color).toBe('green');
      expect(getTyreBadgeProps('WET').color).toBe('blue');
    });
  });
});
