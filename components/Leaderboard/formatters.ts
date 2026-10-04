export function formatLapTime(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined || Number.isNaN(seconds) || seconds <= 0) {
    return '—';
  }
  const mins = Math.floor(seconds / 60);
  const remainderSeconds = seconds % 60;
  const secsFormatted = remainderSeconds.toFixed(3);

  if (mins > 0) {
    const paddedSecs = remainderSeconds < 10 ? `0${secsFormatted}` : secsFormatted;
    return `${mins}:${paddedSecs}`;
  }
  return `${secsFormatted}s`;
}

export function formatGap(gap: number | string | null | undefined, isLeader: boolean): string {
  if (isLeader) return 'LEADER';
  if (gap === null || gap === undefined || gap === '') return '—';
  if (typeof gap === 'number') {
    return gap === 0 ? 'LEADER' : `+${gap.toFixed(3)}s`;
  }
  const str = String(gap).trim();
  if (str === '0' || str.toLowerCase() === 'leader') return 'LEADER';
  if (str.startsWith('+') || str.includes('LAP') || str.includes('L') || str === '—') return str;
  const num = parseFloat(str);
  if (!Number.isNaN(num)) {
    return `+${num.toFixed(3)}s`;
  }
  return str;
}

export function getTyreBadgeProps(compound: string | null | undefined) {
  const c = (compound || '').toUpperCase();
  switch (c) {
    case 'SOFT':
      return { color: 'red', label: 'SOFT', variant: 'filled' as const };
    case 'MEDIUM':
      return { color: 'yellow', label: 'MEDIUM', variant: 'filled' as const };
    case 'HARD':
      return { color: 'gray', label: 'HARD', variant: 'filled' as const };
    case 'INTERMEDIATE':
      return { color: 'green', label: 'INTER', variant: 'filled' as const };
    case 'WET':
      return { color: 'blue', label: 'WET', variant: 'filled' as const };
    default:
      return { color: 'dark', label: compound || 'UNKNOWN', variant: 'light' as const };
  }
}
