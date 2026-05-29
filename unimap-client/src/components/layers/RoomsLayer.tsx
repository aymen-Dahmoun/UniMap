import { Shape } from './Shape';
import type { MapFeature } from '../../models/types';

interface RoomsLayerProps {
  rooms: MapFeature[];
  selectedId?: string;
  onSelect?: (id: string, feature: MapFeature) => void;
}

export function RoomsLayer({ rooms, selectedId, onSelect }: RoomsLayerProps) {
  return (
    <g className="layer-rooms">
      {rooms.map((r) => {
        const isSelected = String(r.properties.id) === selectedId;
        return (
          <Shape
            key={String(r.properties.id)}
            feature={r}
            fill={isSelected ? "#059669" : "#10b981"}
            fillOpacity={isSelected ? 0.55 : 0.35}
            stroke={isSelected ? "#059669" : "#10b981"}
            strokeWidth={isSelected ? 2 : 1}
            style={{ vectorEffect: 'non-scaling-stroke', cursor: 'pointer', transition: 'all 0.2s' }}
            onClick={() => onSelect?.(String(r.properties.id), r)}
          />
        );
      })}
    </g>
  );
}
