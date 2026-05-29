import { useState, useCallback, useRef } from 'react';
import type { RefObject } from 'react';

export type Transform = { x: number; y: number; k: number };

export function usePanZoom(svgRef: RefObject<SVGSVGElement | null>) {
  const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, k: 1 });
  const isDragging = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    isDragging.current = true;
    startPos.current = { x: e.clientX, y: e.clientY };
    (e.target as Element).setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current || !svgRef.current) return;
    const svg = svgRef.current;
    
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    
    const dx = (e.clientX - startPos.current.x) / ctm.a;
    const dy = (e.clientY - startPos.current.y) / ctm.d;

    setTransform((t) => ({ ...t, x: t.x + dx, y: t.y + dy }));
    startPos.current = { x: e.clientX, y: e.clientY };
  }, [svgRef]);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    isDragging.current = false;
    (e.target as Element).releasePointerCapture(e.pointerId);
  }, []);

  const onWheel = useCallback((e: React.WheelEvent) => {
    if (!svgRef.current) return;
    const svg = svgRef.current;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;

    const scaleAdjust = e.deltaY > 0 ? 0.9 : 1.1;
    
    const mx = (e.clientX - ctm.e) / ctm.a;
    const my = (e.clientY - ctm.f) / ctm.d;

    setTransform((t) => {
      const newK = Math.min(Math.max(t.k * scaleAdjust, 0.1), 10);
      
      const ratio = newK / t.k;
      const newX = mx - (mx - t.x) * ratio;
      const newY = my - (my - t.y) * ratio;

      return { x: newX, y: newY, k: newK };
    });
  }, [svgRef]);
  
  const resetTransform = useCallback(() => {
    setTransform({ x: 0, y: 0, k: 1 });
  }, []);

  return { transform, onPointerDown, onPointerMove, onPointerUp, onWheel, resetTransform };
}
