import React, { useRef, useState } from "react";
import type {
  EditorBuilding,
  EditorNode,
  EditorPath,
  EditorMode,
  SelectionState,
} from "./types";
import { calcDistance } from "../../utils/geometry";

interface CanvasProps {
  buildings: EditorBuilding[];
  nodes: EditorNode[];
  paths: EditorPath[];
  mode: EditorMode;
  currentFloor: number;
  selection: SelectionState;
  layersVisible: { buildings: boolean; rooms: boolean; nodes: boolean; paths: boolean };

  // Polygon
  activePolygon: [number, number][];

  // Rectangle
  rectStart: [number, number] | null;
  rectEnd: [number, number] | null;

  // Circle
  circleCenter: [number, number] | null;
  circleEdge: [number, number] | null;

  // Path
  pathStart: { type: "room" | "node"; ref: string; point: [number, number] } | null;

  // Handlers
  handleCanvasClick: (x: number, y: number) => void;
  handleCanvasDoubleClick: () => void;
  handleNodeClick: (id: string, e: React.MouseEvent) => void;
  handleRoomClick: (buildingId: string, roomId: string, e: React.MouseEvent) => void;
  handleItemClick: (type: SelectionState["type"], id: string, e: React.MouseEvent) => void;

  handleRectMouseDown: (x: number, y: number) => void;
  handleRectMouseMove: (x: number, y: number) => void;
  handleRectMouseUp: () => void;

  handleCircleMouseDown: (x: number, y: number) => void;
  handleCircleMouseMove: (x: number, y: number) => void;
  handleCircleMouseUp: () => void;

  // Dragging
  startDragNode: (id: string, e: React.MouseEvent) => void;
  onDragNode: (x: number, y: number) => void;
  stopDragNode: () => void;
  startDragShape: (
    type: "building" | "room",
    id: string,
    x: number,
    y: number,
    e: React.MouseEvent,
    buildingId?: string
  ) => void;
  onDragShape: (x: number, y: number) => void;
  stopDragShape: () => void;
}

export const Canvas: React.FC<CanvasProps> = ({
  buildings,
  nodes,
  paths,
  mode,
  currentFloor,
  selection,
  layersVisible,
  activePolygon,
  rectStart,
  rectEnd,
  circleCenter,
  circleEdge,
  pathStart,
  handleCanvasClick,
  handleCanvasDoubleClick,
  handleNodeClick,
  handleRoomClick,
  handleItemClick,
  handleRectMouseDown,
  handleRectMouseMove,
  handleRectMouseUp,
  handleCircleMouseDown,
  handleCircleMouseMove,
  handleCircleMouseUp,
  startDragNode,
  onDragNode,
  stopDragNode,
  startDragShape,
  onDragShape,
  stopDragShape,
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

  // Filter by floor
  const floorBuildings = buildings.filter((b) => b.floor === currentFloor);
  const floorNodes = nodes.filter((n) => n.floor === currentFloor);
  const floorPaths = paths.filter((p) => p.floor === currentFloor);

  const onMouseDown = (e: React.MouseEvent) => {
    // Middle-click or Alt+click → pan
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      setIsPanning(true);
      setStartPan({ x: e.clientX, y: e.clientY });
      return;
    }
    if (e.button !== 0) return;
    const { x, y } = getSVGCoords(e);

    if (mode === "draw_rectangle") handleRectMouseDown(x, y);
    if (mode === "draw_circle") handleCircleMouseDown(x, y);
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
      if (mode === "draw_rectangle") handleRectMouseMove(coords.x, coords.y);
      if (mode === "draw_circle") handleCircleMouseMove(coords.x, coords.y);
    }
  };

  const onMouseUp = () => {
    setIsPanning(false);
    stopDragNode();
    stopDragShape();
    if (mode === "draw_rectangle") handleRectMouseUp();
    if (mode === "draw_circle") handleCircleMouseUp();
  };

  const onWheel = (e: React.WheelEvent) => {
    const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9;
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

  // Helpers for rect/circle preview
  const rectPreview =
    mode === "draw_rectangle" && rectStart && rectEnd
      ? {
        x: Math.min(rectStart[0], rectEnd[0]),
        y: Math.min(rectStart[1], rectEnd[1]),
        w: Math.abs(rectEnd[0] - rectStart[0]),
        h: Math.abs(rectEnd[1] - rectStart[1]),
      }
      : null;

  const circlePreview =
    mode === "draw_circle" && circleCenter && circleEdge
      ? {
        cx: circleCenter[0],
        cy: circleCenter[1],
        r: calcDistance(circleCenter, circleEdge),
      }
      : null;

  // Nice mode label
  const modeLabels: Record<EditorMode, string> = {
    select: "SELECT",
    draw_polygon: "POLYGON",
    draw_rectangle: "RECTANGLE",
    draw_circle: "CIRCLE",
    add_node: "ADD NODE",
    draw_path: "DRAW PATH",
  };

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

        {/* Grid */}
        <rect x={viewBox.x} y={viewBox.y} width={viewBox.w} height={viewBox.h} fill="url(#grid)" />

        {/* Buildings */}
        {layersVisible.buildings &&
          floorBuildings.map((b) => (
            <g key={b.id}>
              <polygon
                points={b.points.map((c) => c.join(",")).join(" ")}
                fill={selection.type === "building" && selection.id === b.id ? "#bfdbfe" : "#e5e7eb"}
                stroke={selection.type === "building" && selection.id === b.id ? "#3b82f6" : "#9ca3af"}
                strokeWidth="3"
                onClick={(e) => handleItemClick("building", b.id, e)}
                onMouseDown={(e) => {
                  if (mode === "select" && e.button !== 1 && !e.altKey) {
                    const { x, y } = getSVGCoords(e);
                    startDragShape("building", b.id, x, y, e);
                  }
                }}
                className="cursor-pointer hover:stroke-gray-500"
              />
              {/* Building name label */}
              {b.points.length > 0 && (() => {
                const cx = b.points.reduce((s, p) => s + p[0], 0) / b.points.length;
                const cy = b.points.reduce((s, p) => s + p[1], 0) / b.points.length;
                return (
                  <text
                    x={cx}
                    y={cy}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#374151"
                    fontSize="14"
                    fontWeight="600"
                    pointerEvents="none"
                    style={{ userSelect: "none" }}
                  >
                    {b.name}
                  </text>
                );
              })()}

              {/* Rooms inside building */}
              {layersVisible.rooms &&
                b.rooms
                  .filter((r) => r.floor === currentFloor)
                  .map((r) => (
                    <g key={r.id}>
                      <polygon
                        points={r.points.map((c) => c.join(",")).join(" ")}
                        fill={selection.type === "room" && selection.id === r.id ? "#fef08a" : "rgba(254, 249, 195, 0.7)"}
                        stroke={selection.type === "room" && selection.id === r.id ? "#ca8a04" : "#fde047"}
                        strokeWidth="2"
                        onClick={(e) => handleRoomClick(b.id, r.id, e)}
                        onMouseDown={(e) => {
                          if (mode === "select" && e.button !== 1 && !e.altKey) {
                            const { x, y } = getSVGCoords(e);
                            startDragShape("room", r.id, x, y, e, b.id);
                          }
                        }}
                        className="cursor-pointer hover:stroke-yellow-400"
                      />
                      {r.points.length > 0 && (() => {
                        const cx = r.points.reduce((s, p) => s + p[0], 0) / r.points.length;
                        const cy = r.points.reduce((s, p) => s + p[1], 0) / r.points.length;
                        return (
                          <text
                            x={cx}
                            y={cy}
                            textAnchor="middle"
                            dominantBaseline="central"
                            fill="#92400e"
                            fontSize="11"
                            pointerEvents="none"
                            style={{ userSelect: "none" }}
                          >
                            {r.name}
                          </text>
                        );
                      })()}
                    </g>
                  ))}
            </g>
          ))}

        {/* Paths */}
        {layersVisible.paths &&
          floorPaths.map((p) => (
            <line
              key={p.id}
              x1={p.points[0][0]}
              y1={p.points[0][1]}
              x2={p.points[1][0]}
              y2={p.points[1][1]}
              stroke={selection.type === "path" && selection.id === p.id ? "#ef4444" : "#3b82f6"}
              strokeWidth="4"
              onClick={(e) => handleItemClick("path", p.id, e)}
              className="cursor-pointer hover:stroke-blue-400"
            />
          ))}

        {/* Nodes */}
        {layersVisible.nodes &&
          floorNodes.map((n) => {
            const isPathMode = mode === "draw_path";
            const isSelected = selection.type === "node" && selection.id === n.id;
            return (
              <g key={n.id}>
                <circle
                  cx={n.x}
                  cy={n.y}
                  r="8"
                  fill={isSelected ? "#ef4444" : isPathMode ? "#6366f1" : "#10b981"}
                  stroke="#ffffff"
                  strokeWidth="2"
                  onClick={(e) => handleNodeClick(n.id, e)}
                  onMouseDown={(e) => {
                    if (mode === "select" && e.button !== 1 && !e.altKey) {
                      startDragNode(n.id, e);
                    }
                  }}
                  className={`cursor-pointer ${isPathMode ? "hover:fill-indigo-400" : "hover:fill-green-400"}`}
                />
                <text
                  x={n.x}
                  y={n.y - 14}
                  textAnchor="middle"
                  fill="#374151"
                  fontSize="10"
                  pointerEvents="none"
                  style={{ userSelect: "none" }}
                >
                  {n.name}
                </text>
              </g>
            );
          })}

        {/* ── Drawing Previews ── */}

        {/* Polygon preview */}
        {mode === "draw_polygon" && activePolygon.length > 0 && (
          <>
            <polygon
              points={[...activePolygon, [mousePos.x, mousePos.y]].map((p) => p.join(",")).join(" ")}
              fill="rgba(59, 130, 246, 0.15)"
              stroke="#3b82f6"
              strokeDasharray="6 3"
              strokeWidth="2"
            />
            {activePolygon.map((pt, i) => (
              <circle key={i} cx={pt[0]} cy={pt[1]} r="4" fill="#3b82f6" />
            ))}
          </>
        )}

        {/* Rectangle preview */}
        {rectPreview && (
          <rect
            x={rectPreview.x}
            y={rectPreview.y}
            width={rectPreview.w}
            height={rectPreview.h}
            fill="rgba(59, 130, 246, 0.15)"
            stroke="#3b82f6"
            strokeDasharray="6 3"
            strokeWidth="2"
          />
        )}

        {/* Circle preview */}
        {circlePreview && circlePreview.r > 0 && (
          <circle
            cx={circlePreview.cx}
            cy={circlePreview.cy}
            r={circlePreview.r}
            fill="rgba(59, 130, 246, 0.15)"
            stroke="#3b82f6"
            strokeDasharray="6 3"
            strokeWidth="2"
          />
        )}

        {/* Path drawing preview */}
        {mode === "draw_path" && pathStart && (
          <line
            x1={pathStart.point[0]}
            y1={pathStart.point[1]}
            x2={mousePos.x}
            y2={mousePos.y}
            stroke="#93c5fd"
            strokeDasharray="6 3"
            strokeWidth="4"
          />
        )}
      </svg>

      {/* Coordinates */}
      <div className="absolute bottom-4 right-4 bg-white/80 px-2 py-1 rounded shadow text-xs text-gray-700 pointer-events-none">
        X: {Math.round(mousePos.x)}, Y: {Math.round(mousePos.y)}
      </div>

      {/* Mode indicator */}
      <div className="absolute top-4 left-4 pointer-events-none flex items-center gap-2">
        <span className="bg-white/90 text-gray-700 font-semibold text-xs px-2 py-1 rounded shadow">
          {modeLabels[mode]}
        </span>
        <span className="bg-indigo-600 text-white font-semibold text-xs px-2 py-1 rounded shadow">
          Floor {currentFloor}
        </span>
      </div>
    </div>
  );
};
