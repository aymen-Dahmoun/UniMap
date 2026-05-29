import { useState, useCallback, useRef } from 'react';

export type Transform = { x: number; y: number; k: number };

export function usePanZoom() {
  const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, k: 1 });
  const isDragging = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    isDragging.current = true;
    startPos.current = { x: e.clientX, y: e.clientY };
    (e.target as Element).setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - startPos.current.x;
    const dy = e.clientY - startPos.current.y;
    setTransform((t) => ({ ...t, x: t.x + dx, y: t.y + dy }));
    startPos.current = { x: e.clientX, y: e.clientY };
  }, []);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    isDragging.current = false;
    (e.target as Element).releasePointerCapture(e.pointerId);
  }, []);

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const scaleAdjust = e.deltaY > 0 ? 0.9 : 1.1;
    setTransform((t) => {
      const newK = Math.min(Math.max(t.k * scaleAdjust, 0.1), 10);
      // Zoom towards mouse cursor could be computed here, but keeping it simple around center for now
      return { ...t, k: newK };
    });
  }, []);
  
  const resetTransform = useCallback(() => {
    setTransform({ x: 0, y: 0, k: 1 });
  }, []);

  return { transform, onPointerDown, onPointerMove, onPointerUp, onWheel, resetTransform };
}
