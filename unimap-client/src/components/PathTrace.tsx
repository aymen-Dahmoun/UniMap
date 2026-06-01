import { useMemo, useState } from 'react';
import type { MapFeature, PathPoint } from '../models/types';

interface PathTraceProps {
  points: PathPoint[];
  featureLookup: {
    rooms: Map<string, MapFeature>;
    nodes: Map<string, MapFeature>;
  };
}

const formatPoint = (point: PathPoint) => {
  const name = point.name || `${point.type ?? 'node'} ${point.id}`;
  const kind = point.type ? point.type : 'node';
  const detail = point.node_type ? ` • ${point.node_type}` : '';
  const floor = point.floor != null ? ` • Floor ${point.floor}` : '';
  return { name, meta: `${kind}${detail}${floor}` };
};

export function PathTrace({ points, featureLookup }: PathTraceProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);

  const fallbackLookup = useMemo(() => {
    return (id: string, type?: PathPoint['type']) => {
      if (type === 'room') return featureLookup.rooms.get(id);
      if (type === 'node' || type === 'landmark') return featureLookup.nodes.get(id);
      return featureLookup.rooms.get(id) ?? featureLookup.nodes.get(id);
    };
  }, [featureLookup]);

  if (!points || points.length === 0) return null;

  return (
    <div style={{ position: 'absolute', left: 16, right: 16, bottom: 16, backgroundColor: 'white', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '10px 12px', boxShadow: '0 4px 10px rgba(0,0,0,0.08)', zIndex: 50 }}>
      <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>Route</div>
      <div style={{ overflowX: 'auto', overflowY: 'visible' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '4px', position: 'relative' }}>
          {points.map((p, idx) => {
            const { name, meta } = formatPoint(p);
            const id = String(p.id);
            return (
              <div key={`${id}-${idx}`} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{ position: 'relative', display: 'flex', flexDirection: 'column', padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: '6px', background: '#f8fafc', minWidth: '120px' }}
                  onMouseEnter={(e) => {
                    setHoveredId(id);
                    setHoverPos({ x: e.clientX, y: e.clientY });
                  }}
                  onMouseMove={(e) => setHoverPos({ x: e.clientX, y: e.clientY })}
                  onMouseLeave={() => {
                    setHoveredId((prev) => (prev === id ? null : prev));
                    setHoverPos(null);
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: '13px' }}>{name}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{meta}</div>
                </div>
                {idx < points.length - 1 && (
                  <div style={{ fontSize: '16px', color: '#94a3b8' }}>→</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {hoveredId && hoverPos && (() => {
        const feature = fallbackLookup(hoveredId);
        if (!feature) return null;
        return (
          <div
            style={{
              position: 'fixed',
              top: hoverPos.y - 12,
              left: hoverPos.x + 12,
              transform: 'translateY(-100%)',
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              padding: '8px',
              minWidth: '200px',
              boxShadow: '0 6px 12px rgba(0,0,0,0.12)',
              zIndex: 9999,
              pointerEvents: 'none'
            }}
          >
            <div style={{ fontWeight: 700, fontSize: '12px', marginBottom: '6px' }}>Details</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', color: '#334155' }}>
              {Object.entries(feature.properties || {}).map(([k, v]) => (
                <div key={k}><strong>{k}:</strong> {String(v)}</div>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
