import React from 'react';
import { render, screen, fireEvent } from '../../test-utils';
import { VirtualReplayContainer } from './VirtualReplayContainer';
import { Driver } from '../../lib/middleware';
import { LocationPoint } from '../../lib/types/replay';

describe('VirtualReplayContainer', () => {
  const mockDrivers: Driver[] = [
    {
      broadcast_name: 'M VERSTAPPEN',
      country_code: 'NED',
      driver_number: 1,
      first_name: 'Max',
      full_name: 'Max Verstappen',
      headshot_url: null,
      last_name: 'Verstappen',
      meeting_key: 1,
      name_acronym: 'VER',
      session_key: 1,
      team_colour: '3671C6',
      team_name: 'Red Bull Racing',
    },
  ];

  const mockLocations: Record<number, LocationPoint[]> = {
    1: [
      {
        date: '2023-09-03T13:00:00.000Z',
        driver_number: 1,
        meeting_key: 1,
        session_key: 1,
        x: 0,
        y: 0,
        z: 0,
      },
      {
        date: '2023-09-03T13:00:10.000Z',
        driver_number: 1,
        meeting_key: 1,
        session_key: 1,
        x: 1000,
        y: 1000,
        z: 0,
      },
    ],
  };

  it('renders track map and replay controls with driver acronym', () => {
    render(<VirtualReplayContainer locationsByDriver={mockLocations} drivers={mockDrivers} />);

    // Assert driver acronym badge renders
    expect(screen.getByText('VER')).toBeInTheDocument();

    // Assert replay controls render
    expect(screen.getByLabelText('Play')).toBeInTheDocument();
    expect(screen.getByText('SPEED:')).toBeInTheDocument();
  });

  it('toggles play/pause when play button is clicked', () => {
    render(<VirtualReplayContainer locationsByDriver={mockLocations} drivers={mockDrivers} />);

    const playBtn = screen.getByLabelText('Play');
    fireEvent.click(playBtn);
    expect(screen.getByLabelText('Pause')).toBeInTheDocument();
  });

  it('renders loader state when loading prop is true', () => {
    render(<VirtualReplayContainer locationsByDriver={{}} drivers={[]} loading />);

    expect(screen.getByText('Loading Track Replay Telemetry...')).toBeInTheDocument();
  });
});
