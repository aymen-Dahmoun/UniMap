/* eslint-disable react-hooks/exhaustive-deps */
import { useMemo, useRef } from 'react';
import { BuildingsLayer } from './layers/BuildingsLayer';
import { RoomsLayer } from './layers/RoomsLayer';
import { NodesLayer } from './layers/NodesLayer';
import { PathLayer } from './layers/PathLayer';
import { usePanZoom } from '../hooks/usePanZoom';
import { getBoundingBox } from '../utils/geoPath';
import type { MapData, MapFeature } from '../models/types';

interface MapCanvasProps {
  data: MapData;
  pathSegments: MapFeature[];
  selectedId?: string;
  onSelect?: (id: string, feature: MapFeature, type: "room" | "node") => void;
  currentFloor: string;
}

export function MapCanvas({ data, pathSegments, selectedId, onSelect, currentFloor }: MapCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { transform, onPointerDown, onPointerMove, onPointerUp, onWheel, resetTransform } = usePanZoom(svgRef);

  const filterByFloor = (features: MapFeature[]) => {
    if (currentFloor === 'all') return features;
    return features.filter(f => String(f.properties?.floor) === currentFloor || f.properties?.floor == null);
  };

  const buildings = useMemo(() => filterByFloor(data.buildings), [data.buildings, currentFloor]);
  const rooms = useMemo(() => filterByFloor(data.rooms), [data.rooms, currentFloor]);
  const nodes = useMemo(() => filterByFloor(data.nodes), [data.nodes, currentFloor]);
  const paths = useMemo(() => filterByFloor(data.paths), [data.paths, currentFloor]);

  const viewBox = useMemo(() => {
    const allFeatures = [...data.buildings, ...data.rooms, ...data.nodes, ...data.paths];
    if (allFeatures.length === 0) return '0 0 100 100';
    const bb = getBoundingBox(allFeatures);
    const padX = bb.width * 0.1 || 0.01;
    const padY = bb.height * 0.1 || 0.01;
    return `${bb.minX - padX} ${bb.minY - padY} ${bb.width + 2*padX} ${bb.height + 2*padY}`;
  }, [data]);

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative' }}>
      <svg
        ref={svgRef}
        viewBox={viewBox}
        style={{ width: '100%', height: '100%', cursor: 'grab', touchAction: 'none' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onWheel={onWheel}
      >
        <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.k})`}>
          <BuildingsLayer buildings={buildings} />
          <RoomsLayer rooms={rooms} selectedId={selectedId} onSelect={(id, f) => onSelect?.(id, f, 'room')} />
          <NodesLayer nodes={nodes} selectedId={selectedId} onSelect={(id, f) => onSelect?.(id, f, 'node')} />
          <PathLayer pathSegments={paths} stroke="#9ca3af" strokeWidth={1} />
          <PathLayer pathSegments={pathSegments} stroke="#3b82f6" strokeWidth={3} />
        </g>
      </svg>
      <div style={{ position: 'absolute', bottom: 20, right: 20 }}>
        <button onClick={resetTransform} style={{ padding: '8px 12px', background: '#fff', border: '1px solid #ccc', borderRadius: 4, cursor: 'pointer' }}>
          Reset View
        </button>
      </div>
    </div>
  );
}
