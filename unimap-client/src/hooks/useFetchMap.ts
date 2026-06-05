/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { getMap } from '../api/mapService';
import type { MapData, MapFeature, MapGeometry } from '../models/types';

function normalizeToFeature(item: Record<string, unknown>, additionalProps: Record<string, unknown> = {}): MapFeature {
  const geometryStr = item.geometry as string | Record<string, unknown> | null | undefined;
  const geometry = typeof geometryStr === 'string' ? JSON.parse(geometryStr) : geometryStr;
  if (geometry && (geometry as MapFeature).type === 'Feature') {
    return { ...(geometry as MapFeature), properties: { ...(geometry as MapFeature).properties, ...additionalProps } };
  }
  return { type: 'Feature', geometry: geometry as MapGeometry, properties: additionalProps };
}

function ensurePointGeometry(feature: MapFeature): MapFeature {
  if (!feature.geometry || !feature.geometry.type || feature.geometry.coordinates == null) {
    return {
      ...feature,
      geometry: { type: 'Point', coordinates: [0, 0] }
    };
  }
  return feature;
}

export function useFetchMap(mapId: number | null) {
  const [data, setData] = useState<MapData>({ buildings: [], rooms: [], nodes: [], paths: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSpecificMap = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const mapRes = await getMap(id);

      const buildingsRes = mapRes.buildings || [];

      // Collect all rooms
      const roomsRes: any[] = [];
      buildingsRes.forEach((b: any) => {
        if (b.rooms) roomsRes.push(...b.rooms);
      });

      const nodesRes = mapRes.nodes || [];
      const pathsRes = mapRes.paths || [];

      const roomIdSet = new Set(roomsRes.map((i: any) => String(i.id)));
      const filteredNodes = nodesRes.filter((i: any) => !roomIdSet.has(String(i.id)));

      setData({
        buildings: buildingsRes.map((i: any) => normalizeToFeature(i, { id: i.id, name: i.name, floor: i.floor })),
        rooms: roomsRes.map((i: any) => normalizeToFeature(i, { id: i.id, name: i.name, floor: i.floor })),
        nodes: filteredNodes.map((i: any) => ensurePointGeometry(
          normalizeToFeature(i, { id: i.id, name: i.name, node_type: i.node_type, floor: i.floor })
        )),
        paths: pathsRes.map((i: any) => normalizeToFeature(i, { id: i.id, distance: i.distance, floor: i.floor }))
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mapId !== null) {
      fetchSpecificMap(mapId);
    } else {
      setData({ buildings: [], rooms: [], nodes: [], paths: [] });
    }
  }, [mapId]);

  return { data, loading, error, refetch: () => mapId && fetchSpecificMap(mapId) };
}
