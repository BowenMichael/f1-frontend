import { LocationPoint, NormalizedPoint } from '../types/replay';

/**
 * Parses ISO date string or returns timestamp in milliseconds.
 */
export function getTimestamp(dateStr: string): number {
  return new Date(dateStr).getTime();
}

/**
 * Hermite / Catmull-Rom spline interpolation between p1 and p2 using tangent points p0 and p3.
 */
export function catmullRom(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const t2 = t * t;
  const t3 = t2 * t;

  return (
    0.5 *
    (2 * p1 +
      (-p0 + p2) * t +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
      (-p0 + 3 * p1 - 3 * p2 + p3) * t3)
  );
}

/**
 * Finds the index of the first point where timestamp >= targetTime via binary search or linear cursor hint.
 */
export function findClosestPointIndex(
  points: LocationPoint[],
  targetTime: number,
  hintIndex?: number
): number {
  if (points.length === 0) return 0;

  // Optimized cursor check: If targetTime is sequentially right at or after hintIndex
  if (hintIndex !== undefined && hintIndex >= 0 && hintIndex < points.length) {
    const hintTime = getTimestamp(points[hintIndex].date);
    if (hintTime === targetTime) {
      return hintIndex;
    }
    // Check if within next few items (typical sequential playback)
    if (hintTime < targetTime) {
      let curr = hintIndex;
      while (curr < points.length && getTimestamp(points[curr].date) < targetTime) {
        curr += 1;
      }
      if (curr < points.length) {
        return curr;
      }
      return points.length - 1;
    }
  }

  let low = 0;
  let high = points.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const midTime = getTimestamp(points[mid].date);

    if (midTime === targetTime) {
      return mid;
    }
    if (midTime < targetTime) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return low;
}

export interface InterpolationResult extends NormalizedPoint {
  index: number;
}

/**
 * Interpolates coordinates for a given timestamp across location points using spline interpolation.
 */
export function interpolateCarPosition(
  points: LocationPoint[],
  targetTime: number,
  hintIndex?: number
): InterpolationResult | null {
  if (!points || points.length === 0) return null;
  if (points.length === 1) return { x: points[0].x, y: points[0].y, index: 0 };

  const firstTime = getTimestamp(points[0].date);
  const lastTime = getTimestamp(points[points.length - 1].date);

  if (targetTime <= firstTime) {
    return { x: points[0].x, y: points[0].y, index: 0 };
  }
  if (targetTime >= lastTime) {
    const last = points[points.length - 1];
    return { x: last.x, y: last.y, index: points.length - 1 };
  }

  const nextIdx = findClosestPointIndex(points, targetTime, hintIndex);
  const prevIdx = Math.max(0, nextIdx - 1);

  const p1 = points[prevIdx];
  const p2 = points[Math.min(points.length - 1, nextIdx)];

  const t1 = getTimestamp(p1.date);
  const t2 = getTimestamp(p2.date);

  if (t2 <= t1) {
    return { x: p1.x, y: p1.y, index: prevIdx };
  }

  const factor = Math.max(0, Math.min(1, (targetTime - t1) / (t2 - t1)));

  // For spline, sample 4 control points
  const p0 = points[Math.max(0, prevIdx - 1)];
  const p3 = points[Math.min(points.length - 1, nextIdx + 1)];

  return {
    x: catmullRom(p0.x, p1.x, p2.x, p3.x, factor),
    y: catmullRom(p0.y, p1.y, p2.y, p3.y, factor),
    index: prevIdx,
  };
}
