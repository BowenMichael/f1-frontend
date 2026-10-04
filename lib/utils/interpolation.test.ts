import { catmullRom, findClosestPointIndex, interpolateCarPosition } from './interpolation';
import { LocationPoint } from '../types/replay';

describe('interpolation', () => {
  it('computes catmull-rom spline correctly', () => {
    const valStart = catmullRom(0, 10, 20, 30, 0);
    expect(valStart).toBeCloseTo(10);

    const valEnd = catmullRom(0, 10, 20, 30, 1);
    expect(valEnd).toBeCloseTo(20);

    const valMid = catmullRom(0, 10, 20, 30, 0.5);
    expect(valMid).toBeCloseTo(15);
  });

  const mockPoints: LocationPoint[] = [
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
      date: '2023-09-03T13:00:01.000Z',
      driver_number: 1,
      meeting_key: 1,
      session_key: 1,
      x: 100,
      y: 200,
      z: 0,
    },
    {
      date: '2023-09-03T13:00:02.000Z',
      driver_number: 1,
      meeting_key: 1,
      session_key: 1,
      x: 300,
      y: 500,
      z: 0,
    },
  ];

  it('binary search finds closest index correctly', () => {
    const t0 = new Date('2023-09-03T13:00:00.000Z').getTime();
    const tMid = new Date('2023-09-03T13:00:00.500Z').getTime();
    const t2 = new Date('2023-09-03T13:00:02.000Z').getTime();

    expect(findClosestPointIndex(mockPoints, t0)).toBe(0);
    expect(findClosestPointIndex(mockPoints, tMid)).toBe(1);
    expect(findClosestPointIndex(mockPoints, t2)).toBe(2);
  });

  it('interpolates positions smoothly between timestamps', () => {
    const tMid = new Date('2023-09-03T13:00:00.500Z').getTime();
    const pos = interpolateCarPosition(mockPoints, tMid);

    expect(pos).not.toBeNull();
    expect(pos?.x).toBeGreaterThan(0);
    expect(pos?.x).toBeLessThan(100);
    expect(pos?.y).toBeGreaterThan(0);
    expect(pos?.y).toBeLessThan(200);
  });

  it('returns boundaries when targetTime is outside data bounds', () => {
    const tBefore = new Date('2023-09-03T12:59:59.000Z').getTime();
    const posBefore = interpolateCarPosition(mockPoints, tBefore);
    expect(posBefore).toEqual({ x: 0, y: 0, index: 0 });

    const tAfter = new Date('2023-09-03T13:00:05.000Z').getTime();
    const posAfter = interpolateCarPosition(mockPoints, tAfter);
    expect(posAfter).toEqual({ x: 300, y: 500, index: 2 });
  });

  it('supports hintIndex for sequential lookups', () => {
    const tMid = new Date('2023-09-03T13:00:00.500Z').getTime();
    const idx = findClosestPointIndex(mockPoints, tMid, 0);
    expect(idx).toBe(1);

    const pos = interpolateCarPosition(mockPoints, tMid, 0);
    expect(pos?.index).toBe(0);
  });
});
