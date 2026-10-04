/**
 * Earliest year supported by the OpenF1 API (historical data begins in 2023).
 */
export const MIN_F1_SEASON_YEAR = 2023;

/**
 * Returns an array of available championship seasons in descending order
 * from the reference year (defaulting to current year) down to 2023.
 */
export function getAvailableSeasons(currentYear: number = new Date().getFullYear()): string[] {
  const effectiveYear = Math.max(currentYear, MIN_F1_SEASON_YEAR);
  const seasons: string[] = [];
  for (let y = effectiveYear; y >= MIN_F1_SEASON_YEAR; y -= 1) {
    seasons.push(y.toString());
  }
  return seasons;
}

/**
 * Returns the latest default season string.
 */
export function getDefaultSeason(currentYear: number = new Date().getFullYear()): string {
  return getAvailableSeasons(currentYear)[0];
}
