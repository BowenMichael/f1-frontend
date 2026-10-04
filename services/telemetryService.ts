import { GETCarData, GETLaps, Lap } from '../lib/middleware';
import { CarData, TelemetryComparisonPoint } from '../models/telemetry';

export function getFastestLap(laps: Lap[], driverNumber: number): Lap | null {
  const driverLaps = laps.filter(
    (l) =>
      l.driver_number === driverNumber && l.lap_duration && l.lap_duration > 0 && !l.is_pit_out_lap
  );
  if (driverLaps.length === 0) return null;
  return driverLaps.reduce((fastest, current) => {
    if (!fastest.lap_duration) return current;
    if (!current.lap_duration) return fastest;
    return current.lap_duration < fastest.lap_duration ? current : fastest;
  }, driverLaps[0]);
}

export function sampleLapData(data: CarData[], sampleCount = 60): CarData[] {
  if (data.length <= sampleCount) return data;
  const result: CarData[] = [];
  const step = (data.length - 1) / (sampleCount - 1);
  for (let i = 0; i < sampleCount; i++) {
    const idx = Math.min(Math.round(i * step), data.length - 1);
    result.push(data[idx]);
  }
  return result;
}

export function alignTelemetry(
  dataA: CarData[],
  dataB: CarData[],
  sampleCount = 60
): TelemetryComparisonPoint[] {
  const sampledA = sampleLapData(dataA, sampleCount);
  const sampledB = sampleLapData(dataB, sampleCount);
  const points: TelemetryComparisonPoint[] = [];

  for (let i = 0; i < sampleCount; i++) {
    const ptA = sampledA[i] || null;
    const ptB = sampledB[i] || null;
    const distancePercent = Math.round((i / (sampleCount - 1)) * 100);

    points.push({
      distancePercent,
      speedA: ptA ? ptA.speed : null,
      speedB: ptB ? ptB.speed : null,
      throttleA: ptA ? ptA.throttle : null,
      throttleB: ptB ? ptB.throttle : null,
      brakeA: ptA ? ptA.brake : null,
      brakeB: ptB ? ptB.brake : null,
    });
  }

  return points;
}

export async function fetchDriverFastestLapTelemetry(
  sessionKey: number,
  driverNumber: number,
  sessionLaps?: Lap[]
): Promise<CarData[]> {
  let laps = sessionLaps;
  if (!laps || laps.length === 0) {
    laps = await GETLaps(sessionKey, driverNumber);
  }
  const fastestLap = getFastestLap(laps, driverNumber);
  if (!fastestLap || !fastestLap.date_start || !fastestLap.lap_duration) {
    const carData = await GETCarData(sessionKey, driverNumber);
    return (carData || []).slice(0, 100);
  }

  const startDate = new Date(fastestLap.date_start);
  const endDate = new Date(startDate.getTime() + (fastestLap.lap_duration + 2) * 1000);

  const rawCarData = await GETCarData(
    sessionKey,
    driverNumber,
    startDate.toISOString(),
    endDate.toISOString()
  );

  return rawCarData || [];
}
