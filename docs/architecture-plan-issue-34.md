# Architecture Plan: Track Replay Smoothing (Issue #34)

## 1. Architectural Overview
The core objective is to eliminate visual stutter and positional drift when replaying car telemetry. Currently, the track replay engine suffers from two major performance bottlenecks:
1. **React State Animation Overhead**: The `useReplayClock` hook triggers a full React component tree re-render (via `setCurrentTime`) on every `requestAnimationFrame` tick (60 times a second). This includes recalculating array mappings, interpolations, and re-rendering the entire SVG container, causing frame drops and jitter.
2. **Conflicting Interpolations**: The `DriverMarker` component relies on a CSS `transition: transform 0.05s linear` while the engine simultaneously calculates frame-by-frame spline interpolation. These two systems fight each other, creating visual snapping.

**Key Design Decisions:**
- **Direct DOM Mutation**: We will bypass the React render cycle for real-time positional updates. The simulation clock will broadcast time ticks via a custom event (or callback pub/sub), and each `DriverMarker` will listen, calculate its interpolated position, and manually update its SVG `<g>` node's `transform` attribute via a `useRef`.
- **CSS Transition Removal**: CSS transitions will be entirely stripped from the markers, relying solely on the mathematical spline interpolation to achieve a true 60fps fluid motion.
- **Interpolation Caching (Cursor)**: The current binary search (`findClosestPointIndex`) evaluates the entire telemetry array on every frame for every car. We will introduce an index caching mechanism (a "cursor") that remembers the last known array index, reducing the time complexity of finding the next interpolation points from `O(log N)` to `O(1)` amortized.
- **Throttled UI Updates**: The timeline UI (scrubber/clock text) does not need 60fps precision and will be decoupled via throttled React state updates (e.g., 10fps), freeing up the main thread for SVG rendering.

---

## 2. Target Files & Modular Breakdown

**Engine & State Hooks (`lib/hooks/`)**
- `lib/hooks/useReplayClock.ts`: *Modify* to manage an internal time ref. Expose a `subscribeToTick` method (or custom event) for high-frequency updates, and throttle the React `setCurrentTime` state to only update for UI purposes.
- `lib/hooks/useDriverPositions.ts`: *Modify / Deprecate inline interpolation*. Shift from returning computed 60fps array states to providing static initial positions and passing the telemetry data down so markers can compute their own interpolations efficiently.

**Utilities & Services (`lib/utils/` & `lib/services/`)**
- `lib/utils/interpolation.ts`: *Modify* `findClosestPointIndex` to accept a `hintIndex` (cursor) to optimize lookups.
- `lib/services/ReplayEngine.ts` (New, Optional): If logic gets too complex, extract the pub/sub event emitter and cursor caching here to keep files under 250 lines.

**UI Components (`components/Replay/`)**
- `components/Replay/DriverMarker.tsx`: *Modify*. Attach a `useRef` to the `<g>` element. Implement a `useEffect` that subscribes to the clock's tick event, calculates the current position via `interpolateCarPosition`, and applies `.setAttribute('transform', ...)` directly. Remove the inline style `transition`.
- `components/Replay/TrackMap.tsx` & `VirtualReplayContainer.tsx`: *Modify* wiring to pass the raw telemetry data arrays and the clock pub/sub interface down to the markers instead of passing frame-by-frame computed arrays.

---

## 3. Step-by-Step Implementation Guide

**Step 1: Optimize the Interpolation Math**
1. In `lib/utils/interpolation.ts`, update `findClosestPointIndex` to accept an optional `lastIndex` parameter.
2. Implement a quick linear check starting from `lastIndex` before falling back to a full binary search. This ensures that sequential frame reads are O(1).
3. Update `interpolateCarPosition` to also accept and return the `lastIndex` so it can be stored by the caller.

**Step 2: Refactor `useReplayClock` for Pub/Sub**
1. In `lib/hooks/useReplayClock.ts`, retain the `requestAnimationFrame` loop.
2. Instead of calling `setCurrentTime(nextTime)` every frame, store the exact time in a `useRef`.
3. Create a lightweight subscription system (e.g., `Set<Function>`) or dispatch a CustomEvent (`window.dispatchEvent(new CustomEvent('replayTick', { detail: nextTime }))`) inside the loop.
4. Implement a throttled state update for the UI scrubber (e.g., wrap `setCurrentTime` in a 100ms throttle) so the slider still moves without tanking performance.

**Step 3: Update `DriverMarker` for Direct DOM Mutation**
1. In `components/Replay/DriverMarker.tsx`, add a `useRef<SVGGElement>(null)` to the wrapper `<g>`.
2. Remove `transition: 'transform 0.05s linear'` from the `style` prop.
3. Add a `useEffect` that subscribes to the 'replayTick' event.
4. Inside the event listener, read the current time, call `interpolateCarPosition` using the driver's specific telemetry array (passed via props), and call `ref.current.setAttribute('transform', \`translate(\${x}, \${y})\`)`. Maintain a local variable for `lastIndex` to pass into the interpolation.

**Step 4: Rewire the Container & Map**
1. In `VirtualReplayContainer.tsx` and `TrackMap.tsx`, stop mapping over `useDriverPositions` to generate dynamic state arrays.
2. Instead, generate a static array of drivers at mount time. Pass the driver metadata, bounding box, and the *raw telemetry points array* (`locationsByDriver[driver.driver_number]`) directly into each `<DriverMarker>`.
3. Ensure the initial position is correctly rendered before the clock begins ticking.

---

## 5. Verification & Testing Criteria

### Command Log Suppression Execution
Before declaring completion, run these checks silently. If they fail, inspect only the last 40 lines of the log.
- **Type Checking:** `npm run typecheck > typecheck.log 2>&1`
- **Linting:** `npm run lint > lint.log 2>&1`
- **Cleanup:** `Remove-Item typecheck.log, lint.log -ErrorAction SilentlyContinue`

### Acceptance Checklist
- [ ] **Fluid Motion:** Car markers move across the track continuously at 60 FPS without stepping, stuttering, or snapping between points.
- [ ] **No Visual Tearing:** Removing CSS transitions prevents easing conflicts during high-speed playback multipliers (e.g., 5x, 10x).
- [ ] **Seek Stability:** Scrubbing the timeline or clicking the track immediately updates all car positions without positional drift or lag spikes.
- [ ] **React Performance:** Verify in React DevTools (or via console logs) that `VirtualReplayContainer` is not re-rendering 60 times a second during playback.
- [ ] **File Size Constraint:** Verify no file exceeds the 250-line limit.

### Visual Verification
- Take a screenshot of the UI changes (if any structural UI updates occur).
- Record a video demo capturing the smooth real-time replay motion vs. the old discrete tick jumps, showcasing 1x, 2x, and timeline scrubbing. Post this demo in the Pull Request.
