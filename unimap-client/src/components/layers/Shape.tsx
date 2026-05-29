import type { SVGProps } from 'react';
import type { MapFeature } from '../../models/types';
import { geomToPath, getCenter } from '../../utils/geoPath';

interface ShapeProps extends SVGProps<SVGPathElement> {
  feature: MapFeature;
}

export function Shape({ feature, ...svgProps }: ShapeProps) {
  const geom = feature.geometry;

  if (geom.type === 'Point') {
    const center = getCenter(geom);
    if (!center) return null;
    return (
      <circle
        cx={center[0]}
        cy={center[1]}
        {...(svgProps as React.SVGProps<SVGCircleElement>)}
      />
    );
  }

  const d = geomToPath(geom);
  if (!d) return null;

  return (
    <path
      d={d}
      {...svgProps}
    />
  );
}
