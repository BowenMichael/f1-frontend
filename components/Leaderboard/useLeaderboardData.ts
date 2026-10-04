import { useMemo } from 'react';
import { Driver, Lap, Interval, Stint } from '../../lib/middleware';
import { LeaderboardRowData } from './types';
import { formatLapTime, formatGap } from './formatters';

export function useLeaderboardData(
  drivers: Driver[],
  laps: Lap[],
  intervals: Interval[] = [],
  stints: Stint[] = []
): { leaderboardData: LeaderboardRowData[]; fastestLapSeconds: number | null } {
  return useMemo(() => {
    if (!drivers || drivers.length === 0) {
      return { leaderboardData: [], fastestLapSeconds: null };
    }

    // 1. Group laps by driver and calculate best lap
    const bestLapByDriver = new Map<number, number>();
    laps.forEach((lap) => {
      if (typeof lap.lap_duration === 'number' && lap.lap_duration > 0) {
        const currentBest = bestLapByDriver.get(lap.driver_number);
        if (currentBest === undefined || lap.lap_duration < currentBest) {
          bestLapByDriver.set(lap.driver_number, lap.lap_duration);
        }
      }
    });

    // 2. Latest interval / gap by driver
    const latestIntervalByDriver = new Map<number, Interval>();
    intervals.forEach((interval) => {
      latestIntervalByDriver.set(interval.driver_number, interval);
    });

    // 3. Current / Latest stint tyre compound by driver
    const latestStintByDriver = new Map<number, Stint>();
    stints.forEach((stint) => {
      const existing = latestStintByDriver.get(stint.driver_number);
      if (!existing || stint.stint_number >= existing.stint_number) {
        latestStintByDriver.set(stint.driver_number, stint);
      }
    });

    // Map each driver
    const rows = drivers.map((driver) => {
      const bestSeconds = bestLapByDriver.get(driver.driver_number) ?? null;
      const latestInterval = latestIntervalByDriver.get(driver.driver_number);
      const latestStint = latestStintByDriver.get(driver.driver_number);
      const teamColor = driver.team_colour ? `#${driver.team_colour}` : '#868e96';

      return {
        driverNumber: driver.driver_number,
        driverName: driver.full_name || driver.broadcast_name || `Driver #${driver.driver_number}`,
        driverAcronym: driver.name_acronym || `${driver.driver_number}`,
        headshotUrl: driver.headshot_url,
        teamName: driver.team_name || 'Independent',
        teamColor,
        bestLapTime: formatLapTime(bestSeconds),
        bestLapSeconds: bestSeconds,
        rawGap: latestInterval?.gap_to_leader,
        rawInterval: latestInterval?.interval,
        tyreCompound: latestStint?.compound || null,
        tyreLaps: latestStint ? latestStint.lap_end - latestStint.lap_start + 1 : null,
      };
    });

    // Sort order
    rows.sort((a, b) => {
      const gapA = a.rawGap;
      const gapB = b.rawGap;

      const numGapA = typeof gapA === 'number' ? gapA : parseFloat(String(gapA));
      const numGapB = typeof gapB === 'number' ? gapB : parseFloat(String(gapB));

      const validGapA = !Number.isNaN(numGapA) && gapA !== null && gapA !== undefined;
      const validGapB = !Number.isNaN(numGapB) && gapB !== null && gapB !== undefined;

      if (validGapA && validGapB) {
        return numGapA - numGapB;
      }
      if (validGapA) return -1;
      if (validGapB) return 1;

      if (a.bestLapSeconds !== null && b.bestLapSeconds !== null) {
        return a.bestLapSeconds - b.bestLapSeconds;
      }
      if (a.bestLapSeconds !== null) return -1;
      if (b.bestLapSeconds !== null) return 1;
      return a.driverNumber - b.driverNumber;
    });

    const leaderboardData: LeaderboardRowData[] = rows.map((r, index) => {
      const isLeader = index === 0;
      return {
        position: index + 1,
        driverNumber: r.driverNumber,
        driverName: r.driverName,
        driverAcronym: r.driverAcronym,
        headshotUrl: r.headshotUrl,
        teamName: r.teamName,
        teamColor: r.teamColor,
        bestLapTime: r.bestLapTime,
        bestLapSeconds: r.bestLapSeconds,
        gapToLeader: formatGap(r.rawGap, isLeader),
        interval: isLeader ? '—' : formatGap(r.rawInterval, false),
        tyreCompound: r.tyreCompound,
        tyreLaps: r.tyreLaps,
      };
    });

    let fastestLapSeconds: number | null = null;
    leaderboardData.forEach((row) => {
      if (row.bestLapSeconds !== null) {
        if (fastestLapSeconds === null || row.bestLapSeconds < fastestLapSeconds) {
          fastestLapSeconds = row.bestLapSeconds;
        }
      }
    });

    return { leaderboardData, fastestLapSeconds };
  }, [drivers, laps, intervals, stints]);
}
