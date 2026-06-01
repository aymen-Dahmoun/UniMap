import { useState } from 'react';
import { fetchPath } from '../api/pathService';
import type { MapFeature, MapGeometry, PathPoint } from '../models/types';

type Coord = [number, number];

const getCoordFromGeometry = (geom: MapGeometry | null | undefined): Coord | null => {
  if (!geom || !geom.type || geom.coordinates == null) return null;
  if (geom.type === 'Point') {
    return geom.coordinates as Coord;
  }
  if (geom.type === 'Polygon') {
    const ring = geom.coordinates as Coord[][];
    const firstRing = ring?.[0];
    if (!firstRing || firstRing.length === 0) return null;
    const sum = firstRing.reduce((acc, p) => [acc[0] + p[0], acc[1] + p[1]] as Coord, [0, 0]);
    return [sum[0] / firstRing.length, sum[1] / firstRing.length];
  }
  return null;
};

const dist2 = (a: Coord, b: Coord) => {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  return dx * dx + dy * dy;
};

const normalizeLineDirection = (geom: MapGeometry, startCoord: Coord | null, endCoord: Coord | null): MapGeometry => {
  if (!startCoord || !endCoord) return geom;
  if (geom.type === 'LineString') {
    const coords = geom.coordinates as Coord[];
    if (coords.length < 2) return geom;
    const a = coords[0];
    const b = coords[coords.length - 1];
    const forwardScore = dist2(a, startCoord) + dist2(b, endCoord);
    const reverseScore = dist2(a, endCoord) + dist2(b, startCoord);
    if (reverseScore < forwardScore) {
      return { ...geom, coordinates: [...coords].reverse() };
    }
  }
  if (geom.type === 'MultiLineString') {
    const lines = geom.coordinates as Coord[][];
    if (lines.length === 0) return geom;
    const firstLine = lines[0];
    const lastLine = lines[lines.length - 1];
    if (firstLine.length === 0 || lastLine.length === 0) return geom;
    const a = firstLine[0];
    const b = lastLine[lastLine.length - 1];
    const forwardScore = dist2(a, startCoord) + dist2(b, endCoord);
    const reverseScore = dist2(a, endCoord) + dist2(b, startCoord);
    if (reverseScore < forwardScore) {
      const reversed = [...lines].reverse().map((line) => [...line].reverse());
      return { ...geom, coordinates: reversed };
    }
  }
  return geom;
};

export function usePathQuery() {
  const [pathSegments, setPathSegments] = useState<MapFeature[]>([]);
  const [pathPoints, setPathPoints] = useState<PathPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const queryPath = async (startType: string, startId: string, endType: string, endId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPath(startType, startId, endType, endId);
      // data.path_segments has geometries and floors
      const pointsById = new Map<string, Coord>();
      const points: PathPoint[] = (data.path_points || []).map((p: Record<string, unknown>) => {
        const geom = typeof p.geometry === 'string' ? JSON.parse(p.geometry) : p.geometry;
        const coord = getCoordFromGeometry(geom as MapGeometry);
        if (coord && p.id != null) pointsById.set(String(p.id), coord);
        return {
          id: String(p.id),
          name: typeof p.name === 'string' ? p.name : undefined,
          type: (p.type as PathPoint['type']) ?? undefined,
          node_type: typeof p.node_type === 'string' ? p.node_type : undefined,
          floor: typeof p.floor === 'number' ? p.floor : undefined
        };
      });


      const segments: MapFeature[] = (data.path_segments || []).map((s: Record<string, unknown>) => {
        const geometry = typeof s.geometry === 'string' ? JSON.parse(s.geometry) : s.geometry;
        const startCoord = pointsById.get(String(s.start_node_id));
        const endCoord = pointsById.get(String(s.end_node_id));
        const normalizedGeometry = normalizeLineDirection(geometry as MapGeometry, startCoord ?? null, endCoord ?? null);
        return {
          type: 'Feature',
          geometry: normalizedGeometry,
          properties: { floor: s.floor }
        };
      });
      setPathSegments(segments);
      setPathPoints(points);
      return data;
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError(String(err));
      setPathSegments([]);
      setPathPoints([]);
    } finally {
      setLoading(false);
    }
  };

  const clearPath = () => {
    setPathSegments([]);
    setPathPoints([]);
    setError(null);
  };

  return { pathSegments, pathPoints, loading, error, queryPath, clearPath };
}
