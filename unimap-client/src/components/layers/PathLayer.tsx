import { Shape } from './Shape';
import type { MapFeature } from '../../models/types';

interface PathLayerProps {
  pathSegments: MapFeature[];
  stroke?: string;
  strokeWidth?: number;
}

export function PathLayer({ pathSegments, stroke = "#ef4444", strokeWidth = 4 }: PathLayerProps) {
  if (!pathSegments || pathSegments.length === 0) return null;
  const markerId = `path-arrow-${String(stroke).replace(/[^a-zA-Z0-9_-]/g, '')}-${strokeWidth}`;

  return (
    <g className="layer-path">
      <defs>
        <marker
          id={markerId}
          markerWidth="6"
          markerHeight="6"
          refX="5"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L6,3 L0,6 Z" fill={stroke} />
        </marker>
      </defs>
      {pathSegments.map((segment, i) => (
        <Shape
          key={i}
          feature={segment}
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          markerMid={`url(#${markerId})`}
          markerEnd={`url(#${markerId})`}
          style={{ vectorEffect: 'non-scaling-stroke' }}
        />
      ))}
    </g>
  );
}
