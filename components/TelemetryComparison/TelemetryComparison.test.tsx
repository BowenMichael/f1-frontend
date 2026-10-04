import { render, screen, waitFor } from '@/test-utils';
import { TelemetryComparison } from './TelemetryComparison';
import { Driver, Lap } from '../../lib/middleware';
import * as telemetryService from '../../services/telemetryService';

jest.mock('../../services/telemetryService');

const mockDrivers: Driver[] = [
  {
    broadcast_name: 'M VERSTAPPEN',
    country_code: 'NED',
    driver_number: 1,
    first_name: 'Max',
    full_name: 'Max Verstappen',
    headshot_url: null,
    last_name: 'Verstappen',
    meeting_key: 1216,
    name_acronym: 'VER',
    session_key: 9141,
    team_colour: '3671C6',
    team_name: 'Red Bull Racing',
  },
  {
    broadcast_name: 'L HAMILTON',
    country_code: 'GBR',
    driver_number: 44,
    first_name: 'Lewis',
    full_name: 'Lewis Hamilton',
    headshot_url: null,
    last_name: 'Hamilton',
    meeting_key: 1216,
    name_acronym: 'HAM',
    session_key: 9141,
    team_colour: '6CD3BF',
    team_name: 'Mercedes',
  },
];

const mockLaps: Lap[] = [
  {
    meeting_key: 1216,
    session_key: 9141,
    driver_number: 1,
    lap_number: 10,
    date_start: '2023-07-30T13:00:00Z',
    lap_duration: 106.123,
  },
  {
    meeting_key: 1216,
    session_key: 9141,
    driver_number: 44,
    lap_number: 10,
    date_start: '2023-07-30T13:00:00Z',
    lap_duration: 106.456,
  },
];

describe('TelemetryComparison Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders driver selectors and default state', async () => {
    (telemetryService.fetchDriverFastestLapTelemetry as jest.Mock).mockResolvedValue([
      { date: '2023-07-30T13:00:00Z', driver_number: 1, speed: 300, throttle: 100, brake: 0 },
    ]);
    (telemetryService.alignTelemetry as jest.Mock).mockReturnValue([
      {
        distancePercent: 0,
        speedA: 300,
        speedB: 295,
        throttleA: 100,
        throttleB: 98,
        brakeA: 0,
        brakeB: 0,
      },
    ]);

    render(<TelemetryComparison sessionKey={9141} drivers={mockDrivers} laps={mockLaps} />);

    expect(screen.getByText('Telemetry Comparison Viewer')).toBeInTheDocument();
    expect(screen.getByText('Select Drivers to Compare')).toBeInTheDocument();

    await waitFor(() => {
      expect(telemetryService.fetchDriverFastestLapTelemetry).toHaveBeenCalled();
    });
  });

  it('handles empty telemetry response gracefully', async () => {
    (telemetryService.fetchDriverFastestLapTelemetry as jest.Mock).mockResolvedValue([]);
    (telemetryService.alignTelemetry as jest.Mock).mockReturnValue([]);

    render(<TelemetryComparison sessionKey={9141} drivers={mockDrivers} laps={mockLaps} />);

    await waitFor(() => {
      expect(
        screen.getByText('No telemetry data available for the selected driver(s).')
      ).toBeInTheDocument();
    });
  });

  it('handles single driver selection without error', async () => {
    (telemetryService.fetchDriverFastestLapTelemetry as jest.Mock).mockResolvedValue([
      { date: '2023-07-30T13:00:00Z', driver_number: 1, speed: 310, throttle: 100, brake: 0 },
    ]);
    (telemetryService.alignTelemetry as jest.Mock).mockReturnValue([
      {
        distancePercent: 0,
        speedA: 310,
        speedB: null,
        throttleA: 100,
        throttleB: null,
        brakeA: 0,
        brakeB: null,
      },
    ]);

    render(
      <TelemetryComparison sessionKey={9141} drivers={[mockDrivers[0]]} laps={[mockLaps[0]]} />
    );

    await waitFor(() => {
      expect(telemetryService.fetchDriverFastestLapTelemetry).toHaveBeenCalledWith(
        9141,
        1,
        expect.any(Array)
      );
    });
  });
});
