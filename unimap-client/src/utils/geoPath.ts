import type { MapGeometry } from '../models/types';

export function getBoundingBox(features: { geometry: MapGeometry }[]) {
  let minX = Infinity, minY = Infinity;
  let maxX = -Infinity, maxY = -Infinity;

  const update = (coord: [number, number]) => {
    const x = coord[0];
    const y = -coord[1];
    
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  };

  const processCoord = (c: unknown) => {
    if (Array.isArray(c)) {
      if (typeof c[0] === 'number') update(c as [number, number]);
      else c.forEach(processCoord);
    }
  };

  features.forEach(f => {
    if (f.geometry && f.geometry.coordinates) {
      processCoord(f.geometry.coordinates);
    }
  });

  if (minX === Infinity) return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
}

export function geomToPath(geom: MapGeometry): string {
  if (!geom || !geom.coordinates) return '';

  const ptsToPath = (pts: [number, number][], close = false) => {
    if (pts.length === 0) return '';
    const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${-p[1]}`).join(' ');
    return close ? d + ' Z' : d;
  };

  if (geom.type === 'Point') {
    const p = geom.coordinates as [number, number];
    return `M${p[0]},${-p[1]} A0,0 0 1,1 ${p[0]},${-p[1]+0.0001}`; 
  }

  if (geom.type === 'LineString') {
    return ptsToPath(geom.coordinates as [number, number][]);
  }

  if (geom.type === 'Polygon') {
    return (geom.coordinates as [number, number][][]).map((ring) => ptsToPath(ring, true)).join(' ');
  }

  if (geom.type === 'MultiPolygon') {
    return (geom.coordinates as [number, number][][][]).map((poly) => 
      poly.map((ring) => ptsToPath(ring, true)).join(' ')
    ).join(' ');
  }

  return '';
}

export function getCenter(geom: MapGeometry): [number, number] | null {
  if (geom.type === 'Point') {
    const p = geom.coordinates as [number, number];
    return [p[0], -p[1]];
  }
  if (geom.type === 'Polygon') {
    const ring = geom.coordinates as [number, number][];
    const firstRing = ring[0] as unknown as [number, number][];
    if (!firstRing || !firstRing.length) return null;
    let sx = 0, sy = 0;
    firstRing.forEach((p: [number, number]) => { sx += p[0]; sy += -p[1]; });
    return [sx / firstRing.length, sy / firstRing.length];
  }
  return null;
}
