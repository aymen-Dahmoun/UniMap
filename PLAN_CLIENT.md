# Client Map Renderer Plan (UniMap)

## Goal

Build the UniMap client-side map renderer that fetches and renders the campus map on a white canvas (no world map background), with basic map features like zoom, pan, and path selection between start/end nodes.

## Requirements

### Functional

- Fetch map data from the API and render it on a white canvas.
- Render buildings, rooms, navigation nodes, and paths with distinct styles.
- Support zoom in/out and pan.
- Allow the user to select a start and end point and compute/display a path.
- Show basic UI feedback for selection (hover/selected states).
- Handle loading and error states for map fetches and path requests.

### Non‑Functional

- Responsive layout that works on desktop and tablets.
- Smooth interactions (60fps panning/zooming when possible).
- Clear separation of rendering logic from data fetching.
- Simple, maintainable component structure.
- No external map tiles/backgrounds (pure white canvas).

## Suggested Data Sources

- Map fetch endpoint (GeoJSON or map schema): `/map` or equivalent in API.
- Path endpoint: `/path` or equivalent, given `startId` and `endId`.

## Components & Modules

### UI Components

- `MapCanvas`:
  - Canvas/SVG rendering surface.
  - Owns pan/zoom transforms.
- `Toolbar`:
  - Zoom in/out buttons, reset view.
- `NodeSelector`:
  - UI for choosing start/end nodes (search or dropdown).
- `Legend`:
  - Optional color key for buildings/rooms/nodes/paths.

### Render Primitives

- `Shape`:
  - Generic geometry render (polygon/line/point).
  - Props: `dim`, `color`, `stroke`, `strokeWidth`, `opacity`, `selected`.
- `PathLayer`:
  - Renders computed path (highlighted polyline).
- `BuildingsLayer`, `RoomsLayer`, `NodesLayer`:
  - Render their respective collections with style rules.

### Hooks & Services

- `useFetchMap`:
  - Fetch map data, transform to renderable models.
  - Exposes `data`, `loading`, `error`, `refetch`.
- `usePathQuery`:
  - Fetch path between `startId` and `endId`.
  - Exposes `path`, `loading`, `error`.
- `usePanZoom`:
  - Maintains transform state, handles wheel + drag.
- `mapService`:
  - API client for map data.
- `pathService`:
  - API client for pathfinding.

### Data Models

- `MapFeature`:
  - Common shape for building/room/node/path features.
- `RenderStyle`:
  - Styling configuration per layer.

## Execution Plan

### Phase 1: Structure & Fetching

1. Define data models for map features and styles.
2. Implement `mapService` and `useFetchMap`.
3. Add loading/error UI states.

### Phase 2: Rendering Base Map

1. Build `MapCanvas` with white background.
2. Implement `usePanZoom` for zoom/pan.
3. Create `Shape` and base layers (buildings, rooms, nodes).
4. Render map on canvas/SVG with basic styles.

### Phase 3: Path Selection & Display

1. Implement `NodeSelector` UI (start/end selection).
2. Implement `pathService` and `usePathQuery`.
3. Add `PathLayer` to render computed path.

### Phase 4: UX Improvements

1. Add `Toolbar` for zoom/reset.
2. Add hover/selection styles.
3. Add optional `Legend`.

### Phase 5: Hardening

1. Optimize rendering (layer caching where possible).
2. Validate coordinate transforms across all layers.
3. Add edge cases (no path, invalid selections).

## Notes

- Reuse ideas from the legacy client in ignored/ but keep rendering on a plain white canvas.
- Prefer SVG or Canvas based on existing stack; ensure coordinate transforms are centralized.
- Keep styling in a single theme file for easy adjustments.
