import type { MapGeometry } from '../models/types';

export function getBoundingBox(features: { geometry: MapGeometry }[]) {
  let minX = Infinity, minY = Infinity;
  let maxX = -Infinity, maxY = -Infinity;

  const update = (coord: [number, number]) => {
    if (coord[0] < minX) minX = coord[0];
    if (coord[1] < minY) minY = coord[1];
    if (coord[0] > maxX) maxX = coord[0];
    if (coord[1] > maxY) maxY = coord[1];
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
    const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ');
    return close ? d + ' Z' : d;
  };

  if (geom.type === 'Point') {
    const p = geom.coordinates as [number, number];
    // Render point as a small circle (will be positioned via cx, cy instead, but can return path)
    return `M${p[0]},${p[1]} A0,0 0 1,1 ${p[0]},${p[1]+0.0001}`; 
  }

  if (geom.type === 'LineString') {
    return ptsToPath(geom.coordinates);
  }

  if (geom.type === 'Polygon') {
    return geom.coordinates.map((ring: [number, number][]) => ptsToPath(ring, true)).join(' ');
  }

  if (geom.type === 'MultiPolygon') {
    return geom.coordinates.map((poly: [number, number][][]) => 
      poly.map((ring: [number, number][]) => ptsToPath(ring, true)).join(' ')
    ).join(' ');
  }

  return '';
}

export function getCenter(geom: MapGeometry): [number, number] | null {
  if (geom.type === 'Point') return geom.coordinates;
  // Simplified center for Polygons (just average of first ring)
  if (geom.type === 'Polygon') {
    const ring = geom.coordinates[0];
    if (!ring || !ring.length) return null;
    let sx = 0, sy = 0;
    ring.forEach((p: [number, number]) => { sx += p[0]; sy += p[1]; });
    return [sx / ring.length, sy / ring.length];
  }
  return null;
}
