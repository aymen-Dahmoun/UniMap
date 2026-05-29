import { useState } from 'react';
import { fetchPath } from '../api/pathService';
import type { MapFeature } from '../models/types';

export function usePathQuery() {
  const [pathSegments, setPathSegments] = useState<MapFeature[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const queryPath = async (startType: string, startId: string, endType: string, endId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPath(startType, startId, endType, endId);
      // data.path_segments has geometries and floors
      const segments: MapFeature[] = (data.path_segments || []).map((s: Record<string, unknown>) => ({
        type: 'Feature',
        geometry: typeof s.geometry === 'string' ? JSON.parse(s.geometry) : s.geometry,
        properties: { floor: s.floor }
      }));
      setPathSegments(segments);
      return data;
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError(String(err));
      setPathSegments([]);
    } finally {
      setLoading(false);
    }
  };

  const clearPath = () => {
    setPathSegments([]);
    setError(null);
  };

  return { pathSegments, loading, error, queryPath, clearPath };
}
