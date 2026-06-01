import React, { useRef, useState } from "react";
import type { EditorBuilding, EditorRoom, EditorNode, EditorPath, EditorMode, SelectionState } from "./types";

interface CanvasProps {
  buildings: EditorBuilding[];
  rooms: EditorRoom[];
  nodes: EditorNode[];
  paths: EditorPath[];
  mode: EditorMode;
  selection: SelectionState;
  layersVisible: { buildings: boolean; rooms: boolean; nodes: boolean; paths: boolean };
  activePolygon: [number, number][];
  activePathStartNode: string | null;
  handleCanvasClick: (x: number, y: number) => void;
  handleCanvasDoubleClick: () => void;
  handleNodeClick: (id: string, e: React.MouseEvent) => void;
  handleItemClick: (type: SelectionState["type"], id: string, e: React.MouseEvent) => void;
  
  // Dragging
  startDragNode: (id: string, e: React.MouseEvent) => void;
  onDragNode: (x: number, y: number) => void;
  stopDragNode: () => void;
  startDragShape: (type: "building" | "room", id: string, x: number, y: number, e: React.MouseEvent) => void;
  onDragShape: (x: number, y: number) => void;
  stopDragShape: () => void;
}

export const Canvas: React.FC<CanvasProps> = ({
  buildings,
  rooms,
  nodes,
  paths,
  mode,
  selection,
  layersVisible,
  activePolygon,
  activePathStartNode,
  handleCanvasClick,
  handleCanvasDoubleClick,
  handleNodeClick,
  handleItemClick,
  startDragNode, onDragNode, stopDragNode,
  startDragShape, onDragShape, stopDragShape
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, w: 2000, h: 2000 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const getSVGCoords = (e: React.MouseEvent | MouseEvent) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const pt = svgRef.current.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svgRef.current.getScreenCTM()?.inverse());
    return { x: svgP.x, y: svgP.y };
  };

  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      setIsPanning(true);
      setStartPan({ x: e.clientX, y: e.clientY });
      return;
    }
  };

  const onMouseMove = (e: React.MouseEvent) => {
    const coords = getSVGCoords(e);
    setMousePos(coords);
    if (isPanning) {
      const dx = (startPan.x - e.clientX) * (viewBox.w / svgRef.current!.clientWidth);
      const dy = (startPan.y - e.clientY) * (viewBox.h / svgRef.current!.clientHeight);
      setViewBox((v) => ({ ...v, x: v.x + dx, y: v.y + dy }));
      setStartPan({ x: e.clientX, y: e.clientY });
    } else {
      onDragNode(coords.x, coords.y);
      onDragShape(coords.x, coords.y);
    }
  };

  const onMouseUp = () => {
    setIsPanning(false);
    stopDragNode();
    stopDragShape();
  };

  const onWheel = (e: React.WheelEvent) => {
    const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9;
    
    // Zoom around mouse pointer
    if (!svgRef.current) return;
    const pt = svgRef.current.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svgRef.current.getScreenCTM()?.inverse());
    
    setViewBox((v) => {
      const newW = v.w * zoomFactor;
      const newH = v.h * zoomFactor;
      const dx = (svgP.x - v.x) * (1 - zoomFactor);
      const dy = (svgP.y - v.y) * (1 - zoomFactor);
      return { x: v.x + dx, y: v.y + dy, w: newW, h: newH };
    });
  };

  const bgGridSize = 50;

  return (
    <div className="flex-1 relative overflow-hidden bg-gray-100 h-full cursor-crosshair">
      <svg
        ref={svgRef}
        className="w-full h-full"
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onClick={(e) => {
          if (isPanning) return;
          const { x, y } = getSVGCoords(e);
          handleCanvasClick(x, y);
        }}
        onDoubleClick={handleCanvasDoubleClick}
        onWheel={onWheel}
      >
        <defs>
          <pattern id="grid" width={bgGridSize} height={bgGridSize} patternUnits="userSpaceOnUse">
            <path d={`M ${bgGridSize} 0 L 0 0 0 ${bgGridSize}`} fill="none" stroke="#ddd" strokeWidth="1" />
          </pattern>
        </defs>
        
        {/* Infinite Grid Background */}
        <rect x={viewBox.x} y={viewBox.y} width={viewBox.w} height={viewBox.h} fill="url(#grid)" />

        {/* Buildings */}
        {layersVisible.buildings && buildings.map((b) => (
          <polygon
            key={b.id}
            points={b.coordinates.map((c) => c.join(",")).join(" ")}
            fill={selection.type === "building" && selection.id === b.id ? "#bfdbfe" : "#e5e7eb"}
            stroke={selection.type === "building" && selection.id === b.id ? "#3b82f6" : "#9ca3af"}
            strokeWidth="3"
            onClick={(e) => handleItemClick("building", b.id, e)}
            onMouseDown={(e) => {
              if (mode === "select" && e.button !== 1 && !e.altKey) {
                const {x, y} = getSVGCoords(e);
                startDragShape("building", b.id, x, y, e);
              }
            }}
            className="cursor-pointer hover:stroke-gray-500"
          />
        ))}

        {/* Rooms */}
        {layersVisible.rooms && rooms.map((r) => (
          <polygon
            key={r.id}
            points={r.coordinates.map((c) => c.join(",")).join(" ")}
            fill={selection.type === "room" && selection.id === r.id ? "#fef08a" : "#fef9c3"}
            stroke={selection.type === "room" && selection.id === r.id ? "#ca8a04" : "#fde047"}
            strokeWidth="2"
            onClick={(e) => handleItemClick("room", r.id, e)}
            onMouseDown={(e) => {
              if (mode === "select" && e.button !== 1 && !e.altKey) {
                const {x, y} = getSVGCoords(e);
                startDragShape("room", r.id, x, y, e);
              }
            }}
            className="cursor-pointer hover:stroke-yellow-400"
          />
        ))}

        {/* Paths */}
        {layersVisible.paths && paths.map((p) => {
          const start = nodes.find((n) => n.id === p.start_node);
          const end = nodes.find((n) => n.id === p.end_node);
          if (!start || !end) return null;
          return (
            <line
              key={p.id}
              x1={start.x}
              y1={start.y}
              x2={end.x}
              y2={end.y}
              stroke={selection.type === "path" && selection.id === p.id ? "#ef4444" : "#3b82f6"}
              strokeWidth="4"
              onClick={(e) => handleItemClick("path", p.id, e)}
              className="cursor-pointer hover:stroke-blue-400"
            />
          );
        })}

        {/* Nodes */}
        {layersVisible.nodes && nodes.map((n) => (
          <circle
            key={n.id}
            cx={n.x}
            cy={n.y}
            r="8"
            fill={selection.type === "node" && selection.id === n.id ? "#ef4444" : "#10b981"}
            stroke="#ffffff"
            strokeWidth="2"
            onClick={(e) => handleNodeClick(n.id, e)}
            onMouseDown={(e) => {
              if (mode === "select" && e.button !== 1 && !e.altKey) {
                startDragNode(n.id, e);
              }
            }}
            className="cursor-pointer hover:fill-green-400"
          />
        ))}

        {/* Active Drawing Previews */}
        {(mode === "draw_building" || mode === "draw_room") && activePolygon.length > 0 && (
          <>
            <polygon
              points={[...activePolygon, [mousePos.x, mousePos.y]].map(p => p.join(",")).join(" ")}
              fill="rgba(59, 130, 246, 0.2)"
              stroke="#3b82f6"
              strokeDasharray="4 4"
              strokeWidth="2"
            />
            {activePolygon.map((pt, i) => (
              <circle key={i} cx={pt[0]} cy={pt[1]} r="4" fill="#3b82f6" />
            ))}
          </>
        )}

        {/* Active Path Connection Preview */}
        {mode === "connect_nodes" && activePathStartNode && (
          <line
            x1={nodes.find(n => n.id === activePathStartNode)?.x || 0}
            y1={nodes.find(n => n.id === activePathStartNode)?.y || 0}
            x2={mousePos.x}
            y2={mousePos.y}
            stroke="#93c5fd"
            strokeDasharray="4 4"
            strokeWidth="4"
          />
        )}
      </svg>
      
      {/* Coordinates Display */}
      <div className="absolute bottom-4 right-4 bg-white/80 px-2 py-1 rounded shadow text-xs text-gray-700 pointer-events-none">
        X: {Math.round(mousePos.x)}, Y: {Math.round(mousePos.y)}
      </div>

      <div className="absolute top-4 left-4 pointer-events-none text-gray-500 font-semibold text-sm drop-shadow-sm">
        Mode: {mode.replace("_", " ").toUpperCase()}
      </div>
    </div>
  );
};
