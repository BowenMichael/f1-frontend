import { computeBoundingBox, normalizeCoordinate, createSvgPath } from './coordinate-mapper';
import { TrackBoundingBox } from '../types/replay';

describe('coordinate-mapper', () => {
  const samplePoints = [
    { x: 100, y: 200 },
    { x: 300, y: 600 },
    { x: -100, y: 0 },
  ];

  it('computes correct padded bounding box', () => {
    const box = computeBoundingBox(samplePoints, 0.1);
    expect(box.minX).toBeLessThan(-100);
    expect(box.maxX).toBeGreaterThan(300);
    expect(box.minY).toBeLessThan(0);
    expect(box.maxY).toBeGreaterThan(600);
    expect(box.width).toBe(box.maxX - box.minX);
    expect(box.height).toBe(box.maxY - box.minY);
  });

  it('handles empty points array gracefully', () => {
    const box = computeBoundingBox([]);
    expect(box.width).toBe(1000);
    expect(box.height).toBe(1000);
  });

  it('normalizes coordinates into target viewBox', () => {
    const box: TrackBoundingBox = {
      minX: 0,
      maxX: 100,
      minY: 0,
      maxY: 100,
      width: 100,
      height: 100,
    };

    const normCenter = normalizeCoordinate(50, 50, box, 800, 500);
    expect(normCenter.x).toBeGreaterThan(0);
    expect(normCenter.x).toBeLessThan(800);
    expect(normCenter.y).toBeGreaterThan(0);
    expect(normCenter.y).toBeLessThan(500);
  });

  it('creates valid SVG path commands', () => {
    const box = computeBoundingBox(samplePoints, 0);
    const path = createSvgPath(samplePoints, box, 800, 500);
    expect(path).toMatch(/^ M/);
    expect(path).toContain('L');
  });
});
