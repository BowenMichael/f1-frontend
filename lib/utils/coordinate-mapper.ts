import { NormalizedPoint, TrackBoundingBox } from '../types/replay';

/**
 * Computes bounding box for a set of raw coordinate points.
 */
export function computeBoundingBox(
  points: { x: number; y: number }[],
  paddingRatio = 0.05
): TrackBoundingBox {
  if (!points || points.length === 0) {
    return { minX: 0, maxX: 1000, minY: 0, maxY: 1000, width: 1000, height: 1000 };
  }

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  points.forEach((pt) => {
    if (pt.x < minX) minX = pt.x;
    if (pt.x > maxX) maxX = pt.x;
    if (pt.y < minY) minY = pt.y;
    if (pt.y > maxY) maxY = pt.y;
  });

  const rawWidth = maxX - minX || 1;
  const rawHeight = maxY - minY || 1;

  const padX = rawWidth * paddingRatio;
  const padY = rawHeight * paddingRatio;

  const paddedMinX = minX - padX;
  const paddedMaxX = maxX + padX;
  const paddedMinY = minY - padY;
  const paddedMaxY = maxY + padY;

  return {
    minX: paddedMinX,
    maxX: paddedMaxX,
    minY: paddedMinY,
    maxY: paddedMaxY,
    width: paddedMaxX - paddedMinX,
    height: paddedMaxY - paddedMinY,
  };
}

/**
 * Maps raw coordinates to an SVG viewBox (preserving aspect ratio with centering).
 */
export function normalizeCoordinate(
  x: number,
  y: number,
  box: TrackBoundingBox,
  viewBoxWidth = 800,
  viewBoxHeight = 500
): NormalizedPoint {
  if (box.width === 0 || box.height === 0) {
    return { x: viewBoxWidth / 2, y: viewBoxHeight / 2 };
  }

  // Calculate scale preserving aspect ratio
  const scale = Math.min(viewBoxWidth / box.width, viewBoxHeight / box.height);

  // Inverted Y because SVG (0,0) is top-left, whereas coordinate space is typically Cartesian
  const normX = (x - box.minX) * scale;
  const normY = (box.maxY - y) * scale;

  // Center the track inside the viewBox
  const renderedWidth = box.width * scale;
  const renderedHeight = box.height * scale;
  const offsetX = (viewBoxWidth - renderedWidth) / 2;
  const offsetY = (viewBoxHeight - renderedHeight) / 2;

  return {
    x: normX + offsetX,
    y: normY + offsetY,
  };
}

/**
 * Builds an SVG path string from an array of ordered coordinates.
 */
export function createSvgPath(
  points: { x: number; y: number }[],
  box: TrackBoundingBox,
  viewBoxWidth = 800,
  viewBoxHeight = 500
): string {
  if (!points || points.length === 0) return '';

  return points.reduce((path, pt, index) => {
    const norm = normalizeCoordinate(pt.x, pt.y, box, viewBoxWidth, viewBoxHeight);
    const cmd = index === 0 ? 'M' : 'L';
    return `${path} ${cmd} ${norm.x.toFixed(1)} ${norm.y.toFixed(1)}`;
  }, '');
}
