/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { fetchMapLayer } from '../api/mapService';
import type { MapData, MapFeature } from '../models/types';

function normalizeToFeature(item: Record<string, unknown>, additionalProps: Record<string, unknown> = {}): MapFeature {
  const geometryStr = item.geometry as string | Record<string, unknown>;
  const geometry = typeof geometryStr === 'string' ? JSON.parse(geometryStr) : geometryStr;
  if (geometry.type === 'Feature') {
    return { ...geometry, properties: { ...geometry.properties, ...additionalProps } };
  }
  return { type: 'Feature', geometry: geometry as any, properties: additionalProps };
}

export function useFetchMap() {
  const [data, setData] = useState<MapData>({ buildings: [], rooms: [], nodes: [], paths: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [buildingsRes, roomsRes, nodesRes, pathsRes] = await Promise.all([
        fetchMapLayer('buildings'),
        fetchMapLayer('rooms'),
        fetchMapLayer('nodes'),
        fetchMapLayer('path')
      ]);

      setData({
        buildings: buildingsRes.map((i: any) => normalizeToFeature(i, { id: i.id, name: i.name, floor: i.floor })),
        rooms: roomsRes.map((i: any) => normalizeToFeature(i, { id: i.id, name: i.name, floor: i.floor })),
        nodes: nodesRes.map((i: any) => normalizeToFeature(i, { id: i.id, name: i.name, node_type: i.node_type, floor: i.floor })),
        paths: pathsRes.map((i: any) => normalizeToFeature(i, { id: i.id, distance: i.distance, floor: i.floor }))
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  return { data, loading, error, refetch: fetchAll };
}
