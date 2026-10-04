import { Driver, Lap, Interval, Stint } from '../../lib/middleware';

export interface LeaderboardRowData {
  position: number;
  driverNumber: number;
  driverName: string;
  driverAcronym: string;
  headshotUrl: string | null;
  teamName: string;
  teamColor: string;
  bestLapTime: string;
  bestLapSeconds: number | null;
  gapToLeader: string;
  interval: string;
  tyreCompound: string | null;
  tyreLaps: number | null;
}

export interface LeaderboardProps {
  drivers: Driver[];
  laps: Lap[];
  intervals?: Interval[];
  stints?: Stint[];
  loading?: boolean;
  error?: string | null;
  title?: string;
}
