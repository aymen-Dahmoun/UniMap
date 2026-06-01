import { Shape } from './Shape';
import type { MapFeature } from '../../models/types';

interface NodesLayerProps {
  nodes: MapFeature[];
  selectedId?: string;
  onSelect?: (id: string, feature: MapFeature) => void;
}

export function NodesLayer({ nodes, selectedId, onSelect }: NodesLayerProps) {
  return (
    <g className="layer-nodes">
      {nodes.map((n) => {
        const isSelected = String(n.properties.id) === selectedId;
        return (
          <Shape
            key={String(n.properties.id)}
            feature={n}
            r={isSelected ? 0.00005 : 0.00004}
            fill={isSelected ? "#ea580c" : "#f97316"}
            fillOpacity={isSelected ? 1 : 0.9}
            stroke={isSelected ? "#ea580c" : "#f97316"}
            strokeWidth={isSelected ? 2 : 1}
            style={{ vectorEffect: 'non-scaling-stroke', cursor: 'pointer', transition: 'all 0.2s' }}
            onClick={() => onSelect?.(String(n.properties.id), n)}
          />
        );
      })}
    </g>
  );
}
