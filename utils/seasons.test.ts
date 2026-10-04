import { getAvailableSeasons, getDefaultSeason, MIN_F1_SEASON_YEAR } from './seasons';

describe('seasons utility', () => {
  it('generates descending seasons down to MIN_F1_SEASON_YEAR (2023)', () => {
    const seasons2024 = getAvailableSeasons(2024);
    expect(seasons2024).toEqual(['2024', '2023']);

    const seasons2026 = getAvailableSeasons(2026);
    expect(seasons2026).toEqual(['2026', '2025', '2024', '2023']);
  });

  it('handles year equal to or lower than MIN_F1_SEASON_YEAR', () => {
    const seasons2023 = getAvailableSeasons(2023);
    expect(seasons2023).toEqual(['2023']);

    const seasonsPast = getAvailableSeasons(2020);
    expect(seasonsPast).toEqual(['2023']);
  });

  it('provides the latest default season', () => {
    expect(getDefaultSeason(2025)).toBe('2025');
    expect(getDefaultSeason(2026)).toBe('2026');
  });
});
