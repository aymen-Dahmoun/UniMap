import { Shape } from './Shape';
import type { MapFeature } from '../../models/types';

interface BuildingsLayerProps {
  buildings: MapFeature[];
}

export function BuildingsLayer({ buildings }: BuildingsLayerProps) {
  return (
    <g className="layer-buildings">
      {buildings.map((b) => (
        <Shape
          key={String(b.properties.id)}
          feature={b}
          fill="#0ea5e9"
          fillOpacity={0.35}
          stroke="#0ea5e9"
          strokeWidth={2}
          style={{ vectorEffect: 'non-scaling-stroke' }}
        />
      ))}
    </g>
  );
}
