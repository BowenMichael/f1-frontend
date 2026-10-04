export interface LocationPoint {
  date: string;
  driver_number: number;
  meeting_key: number;
  session_key: number;
  x: number;
  y: number;
  z: number;
}

export interface NormalizedPoint {
  x: number;
  y: number;
}

export interface TrackBoundingBox {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  width: number;
  height: number;
}

export interface DriverState {
  driver_number: number;
  acronym: string;
  fullName: string;
  teamColour: string;
  x: number;
  y: number;
}

export type PlaybackSpeed = 1 | 2 | 5 | 10;
