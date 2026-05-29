import { Shape } from './Shape';
import type { MapFeature } from '../../models/types';

interface PathLayerProps {
  pathSegments: MapFeature[];
  stroke?: string;
  strokeWidth?: number;
}

export function PathLayer({ pathSegments, stroke = "#ef4444", strokeWidth = 4 }: PathLayerProps) {
  if (!pathSegments || pathSegments.length === 0) return null;

  return (
    <g className="layer-path">
      {pathSegments.map((segment, i) => (
        <Shape
          key={i}
          feature={segment}
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ vectorEffect: 'non-scaling-stroke' }}
        />
      ))}
    </g>
  );
}
