# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Repository audit & documentation report for active and unmerged branches ([#46](https://github.com/BowenMichael/f1-frontend/issues/46)).

## [1.2.1] - 2026-10-04

### Added
- Repository management toolset in `scripts/branch-manager/` with automated branch and worktree audit and cleanup utilities ([#40](https://github.com/BowenMichael/f1-frontend/issues/40), [PR #42](https://github.com/BowenMichael/f1-frontend/pull/42)).

### Fixed
- Fixed Yarn Berry 4.0.1 immutable lockfile divergence preventing CI/production deployment on Vercel ([#44](https://github.com/BowenMichael/f1-frontend/issues/44), [PR #45](https://github.com/BowenMichael/f1-frontend/pull/45)).
- Added `tsx` executable support for development automation scripts ([#44](https://github.com/BowenMichael/f1-frontend/issues/44), [PR #45](https://github.com/BowenMichael/f1-frontend/pull/45)).

## [1.2.0] - 2026-10-04

### Added
- Application Patch Notes drawer component and header button trigger to display live release notes and historical updates in production ([#39](https://github.com/BowenMichael/f1-frontend/issues/39), [PR #43](https://github.com/BowenMichael/f1-frontend/pull/43)).
- Live broadcast-style race leaderboard component with dynamic intervals, leader offset gaps, driver tags, and tire stint indicators ([#35](https://github.com/BowenMichael/f1-frontend/issues/35), [PR #36](https://github.com/BowenMichael/f1-frontend/pull/36)).
- Agent-driven development starter blueprint and multi-agent coordination guidelines ([#4](https://github.com/BowenMichael/f1-frontend/issues/4), [PR #5](https://github.com/BowenMichael/f1-frontend/pull/5)).
- Detailed scope documentation and visual mockups for historical race replay simulation ([#2](https://github.com/BowenMichael/f1-frontend/issues/2), [PR #3](https://github.com/BowenMichael/f1-frontend/pull/3)).

### Fixed
- OpenF1 REST API date query parameter encoding bug in `/car_data` query strings causing HTTP 404 responses ([#32](https://github.com/BowenMichael/f1-frontend/issues/32), [PR #38](https://github.com/BowenMichael/f1-frontend/pull/38)).
- Decoupled rigid two-driver requirement in telemetry comparison viewer to gracefully support single-driver analysis ([#32](https://github.com/BowenMichael/f1-frontend/issues/32), [PR #38](https://github.com/BowenMichael/f1-frontend/pull/38)).
- Ignored `.worktrees` directory in Jest test configuration to eliminate duplicate test discovery conflicts.

### Performance
- Optimized 2D Virtual Track Replay engine with direct animation loop and hint-assisted binary search for continuous 60fps telemetry interpolation ([#34](https://github.com/BowenMichael/f1-frontend/issues/34), [PR #41](https://github.com/BowenMichael/f1-frontend/pull/41)).
- Memoized track map SVG silhouetting and throttled scrubbers to eliminate render bottlenecks during high-frequency playback ([#33](https://github.com/BowenMichael/f1-frontend/issues/33), [PR #37](https://github.com/BowenMichael/f1-frontend/pull/37)).

## [1.1.0] - 2026-10-03

### Added
- Interactive 2D Virtual Track Replay engine supporting car position rendering, session playback, and timeline scrub controls ([#27](https://github.com/BowenMichael/f1-frontend/pull/27)).
- Visual regression and PR verification workflow using Playwright capture suites ([#28](https://github.com/BowenMichael/f1-frontend/issues/28), [PR #29](https://github.com/BowenMichael/f1-frontend/pull/29)).
- Dynamic F1 season and race meeting selector supporting data exploration up to current calendar years ([#23](https://github.com/BowenMichael/f1-frontend/issues/23), [PR #25](https://github.com/BowenMichael/f1-frontend/pull/25)).
- Interactive telemetry comparison graphs featuring speed, throttle, and brake traces ([#8](https://github.com/BowenMichael/f1-frontend/issues/8), [PR #26](https://github.com/BowenMichael/f1-frontend/pull/26)).
- Real-time Vercel deployment status indicator badge in the navigation header ([#14](https://github.com/BowenMichael/f1-frontend/issues/14), [PR #22](https://github.com/BowenMichael/f1-frontend/pull/22)).

## [1.0.0] - 2026-09-28

### Added
- Initial production release of F1 Frontend application.
- OpenF1 API integration layer for sessions, drivers, laps, telemetry, and pit intervals.
- Mantine v7 UI system foundation with responsive layout and dark/light color scheme toggle.
