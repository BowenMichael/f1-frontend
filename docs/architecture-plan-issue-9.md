# Architecture Plan: 2D Virtual Track Replay & Simulation Engine

## 1. Architectural Overview
The 2D Virtual Track Replay Engine is a frontend subsystem designed to ingest raw telemetry and location data from the OpenF1 API and visually recreate the race in real-time. 

**Key Design Decisions:**
- **Rendering Engine:** An SVG-based coordinate system. Given ~20 cars on track, SVG DOM updates are highly performant in React, vastly simpler to style (glow effects, driver acronyms, tooltips) than HTML5 Canvas, and easier to map normalized coordinates to.
- **State & Clock Independence:** The simulation "clock" (time-tracking) is decoupled from the data fetching and rendering. A dedicated React hook (`useReplayClock`) drives a `requestAnimationFrame` loop to ensure a smooth 60 FPS update cycle independent of React's render lifecycle for the heavy calculations.
- **Interpolation Strategy:** OpenF1 telemetry locations are discrete timestamps. To achieve 60 FPS motion, the engine uses linear (or Catmull-Rom) interpolation between the closest previous and next telemetry points based on the current simulation clock time.
- **Coordinate Normalization:** Raw X/Y coordinates from OpenF1 are mapped to a normalized 0-100% or internal SVG coordinate space using bounding box detection (finding the absolute min/max X and Y values from the track data).

---

## 2. Target Files & Modular Breakdown
To strictly adhere to the **<250 lines Anti-Monolith Rule**, the logic is decomposed across distinct domains:

**Models & Types (`lib/types/`)**
- `lib/types/replay.ts`: Interfaces for OpenF1 Location data, Replay State, and normalized coordinate boundaries.

**Utilities (`lib/utils/`)**
- `lib/utils/coordinate-mapper.ts`: Pure functions for finding track boundaries and mapping raw `[x, y]` telemetry to normalized SVG coordinates.
- `lib/utils/interpolation.ts`: Pure math functions to interpolate X/Y values between two time-stamped location points.

**Engine & State Hooks (`lib/hooks/`)**
- `lib/hooks/useReplayClock.ts`: Manages the `requestAnimationFrame` loop, playback speed multipliers, play/pause toggles, and manual scrubbing. Yields the `currentSessionTime`.
- `lib/hooks/useDriverPositions.ts`: Subscribes to `currentSessionTime`. Finds the nearest telemetry points for each driver and yields an array of their current interpolated X/Y coordinates.

**UI Components (`components/Replay/`)**
- `components/Replay/TrackSilhouette.tsx`: Renders the glowing track layout as an SVG `<polyline>` or `<path>`.
- `components/Replay/DriverMarker.tsx`: A single SVG `<g>` containing a colored dot and driver acronym text.
- `components/Replay/ReplayControls.tsx`: Mantine UI component containing the Play/Pause button, a `Slider` for the timeline scrubber, and speed multiplier controls (`1x`, `2x`, `5x`, `10x`).
- `components/Replay/TrackMap.tsx`: The master SVG container that composes the `TrackSilhouette` and loops through `DriverMarker`s.
- `components/Replay/VirtualReplayContainer.tsx`: The top-level orchestrator. Fetches/passes data to the hooks, and renders `TrackMap` and `ReplayControls` in a responsive layout.

---

## 3. Step-by-Step Implementation Guide

**Step 1: Core Types & Coordinate Math**
1. Create `lib/types/replay.ts` to define the shape of location data and bounding boxes.
2. Implement `lib/utils/coordinate-mapper.ts`. Write functions to parse all location points to find `minX, maxX, minY, maxY`. Write a `normalizePoint` function that converts any X/Y into a percentage-based or static SVG internal coordinate, maintaining the track's aspect ratio.

**Step 2: Interpolation Logic**
1. Implement `lib/utils/interpolation.ts`. Create a function that accepts a target timestamp, a previous data point, and a next data point. It must return the interpolated X and Y values proportional to the time difference.

**Step 3: State & Simulation Clock**
1. Implement `lib/hooks/useReplayClock.ts`. Expose state for `isPlaying`, `speedMultiplier`, and `currentTime`. Use `requestAnimationFrame` to increment `currentTime` based on system time delta multiplied by the `speedMultiplier`. Ensure scrubbing the timeline updates the time instantly.

**Step 4: Driver Position Resolution**
1. Implement `lib/hooks/useDriverPositions.ts`. Combine the raw data and `currentTime`. For each driver, use binary search or pointer caching to efficiently find the closest telemetry frames, pass them to the interpolation utility, and return the exact current frame coordinates.

**Step 5: Visual Components**
1. Build `TrackSilhouette.tsx`. Use a subset of telemetry (e.g., one full lap of a single driver) to draw a `<path>` representing the circuit. Apply CSS filters for a neon/glow effect.
2. Build `DriverMarker.tsx`. Must support dynamic X/Y translation, dynamic colors (team colors), and display a 3-letter acronym.

**Step 6: UI Controls & Integration**
1. Build `ReplayControls.tsx` utilizing Mantine UI components. Hook up the slider to the total duration of the session data.
2. Build `VirtualReplayContainer.tsx`. Mount the engine hooks, pass down the `currentTime` to the Map, and link the controls to the clock hook's dispatch functions.

---

## 4. Verification & Testing Criteria

### Command Log Suppression Execution
Before declaring completion, the following checks must be run silently with redirected logs:
- **Type Checking:** `npm run typecheck > typecheck.log 2>&1`
- **Linting:** `npm run lint > lint.log 2>&1`
*(Only view the last 40 lines using `Get-Content -Tail 40` if the exit code is non-zero, then clean up logs).*

### Acceptance Checklist
- [ ] **Data Mapping:** Track fits within the container without distortion; coordinates map correctly.
- [ ] **Frame Rate & Interpolation:** Cars move fluidly at 60 FPS without jumping natively between large gaps in telemetry.
- [ ] **Scrubber Responsiveness:** Pausing stops movement immediately; scrubbing jumps the cars accurately to the historical frame; speed changes apply instantly.
- [ ] **Anti-Monolith Check:** Ensure absolutely no file exceeds 250 lines (verify via `wc -l` or file inspection).

### Visual Verification
- Record a short video/gif walkthrough of the interface showing the glowing track, car markers moving, pausing, accelerating to 10x, and scrubbing through the timeline. Post this in the Pull Request.
