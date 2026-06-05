import { useState, useCallback } from "react";
import type {
  EditorBuilding,
  EditorRoom,
  EditorNode,
  EditorPath,
  EditorMapInfo,
  EditorMode,
  DrawTarget,
  SelectionState,
  NodeType,
} from "../components/MapEditor/types";
import {
  polygonToWKT,
  pointToWKT,
  lineToWKT,
  rectToPolygonPoints,
  circleToPolygonPoints,
  calcDistance,
  polygonCentroid,
  pointInPolygon,
} from "../utils/geometry";

export function useMapEditor() {
  /* ── Map metadata ── */
  const [mapInfo, setMapInfoState] = useState<EditorMapInfo>({
    name: "",
    user_email: "",
  });
  const updateMapInfo = (u: Partial<EditorMapInfo>) =>
    setMapInfoState((p) => ({ ...p, ...u }));

  /* ── Entity stores ── */
  const [buildings, setBuildings] = useState<EditorBuilding[]>([]);
  const [nodes, setNodes] = useState<EditorNode[]>([]);
  const [paths, setPaths] = useState<EditorPath[]>([]);

  /* ── Editor state ── */
  const [mode, setMode] = useState<EditorMode>("select");
  const [drawTarget, setDrawTarget] = useState<DrawTarget>("building");
  const [currentFloor, setCurrentFloor] = useState(0);
  const [selection, setSelection] = useState<SelectionState>({
    type: null,
    id: null,
  });

  /* ── Layer visibility ── */
  const [layersVisible, setLayersVisible] = useState({
    buildings: true,
    rooms: true,
    nodes: true,
    paths: true,
  });
  const toggleLayer = (layer: keyof typeof layersVisible) =>
    setLayersVisible((p) => ({ ...p, [layer]: !p[layer] }));

  /* ── Drawing intermediates ── */
  // Polygon mode
  const [activePolygon, setActivePolygon] = useState<[number, number][]>([]);
  // Rectangle mode
  const [rectStart, setRectStart] = useState<[number, number] | null>(null);
  const [rectEnd, setRectEnd] = useState<[number, number] | null>(null);
  // Circle mode
  const [circleCenter, setCircleCenter] = useState<[number, number] | null>(null);
  const [circleEdge, setCircleEdge] = useState<[number, number] | null>(null);
  // Path mode
  const [pathStart, setPathStart] = useState<{
    type: "room" | "node";
    ref: string;
    point: [number, number];
  } | null>(null);

  /* ── ID generator ── */
  const genId = () => crypto.randomUUID();

  /* ── Mode switching ── */
  const changeMode = useCallback((m: EditorMode) => {
    setMode(m);
    setActivePolygon([]);
    setRectStart(null);
    setRectEnd(null);
    setCircleCenter(null);
    setCircleEdge(null);
    setPathStart(null);
    if (m !== "select") setSelection({ type: null, id: null });
  }, []);

  /* ── Floor helpers ── */
  const floorUp = () => setCurrentFloor((f) => f + 1);
  const floorDown = () => setCurrentFloor((f) => f - 1);

  /* ── Finalize a drawn shape into a building or room ── */
  const finalizeShape = useCallback(
    (points: [number, number][]) => {
      if (points.length < 3) return;

      if (drawTarget === "building") {
        const b: EditorBuilding = {
          id: genId(),
          name: "New Building",
          floor: currentFloor,
          points,
          rooms: [],
        };
        setBuildings((prev) => [...prev, b]);
        changeMode("select");
        setSelection({ type: "building", id: b.id });
      } else {
        // Room — auto-detect parent building
        const centroid = polygonCentroid(points);
        const parent = buildings.find(
          (b) =>
            b.floor === currentFloor && pointInPolygon(centroid, b.points)
        );
        if (!parent) {
          alert("Draw the room inside a building on the same floor.");
          return;
        }
        const r: EditorRoom = {
          id: genId(),
          name: "New Room",
          floor: currentFloor,
          points,
        };
        setBuildings((prev) =>
          prev.map((b) =>
            b.id === parent.id ? { ...b, rooms: [...b.rooms, r] } : b
          )
        );
        changeMode("select");
        setSelection({ type: "room", id: r.id });
      }
    },
    [drawTarget, currentFloor, buildings, changeMode]
  );

  /* ── Canvas click ── */
  const handleCanvasClick = useCallback(
    (x: number, y: number) => {
      if (mode === "draw_polygon") {
        setActivePolygon((p) => [...p, [x, y]]);
      } else if (mode === "add_node") {
        const n: EditorNode = {
          id: genId(),
          name: "New Node",
          floor: currentFloor,
          x,
          y,
          node_type: "normal",
        };
        setNodes((prev) => [...prev, n]);
        changeMode("select");
        setSelection({ type: "node", id: n.id });
      } else if (mode === "select") {
        setSelection({ type: null, id: null });
      }
    },
    [mode, currentFloor, changeMode]
  );

  /* ── Double-click finishes polygon ── */
  const handleCanvasDoubleClick = useCallback(() => {
    if (mode === "draw_polygon" && activePolygon.length >= 3) {
      finalizeShape(activePolygon);
    }
  }, [mode, activePolygon, finalizeShape]);

  /* ── Rectangle drag ── */
  const handleRectMouseDown = useCallback(
    (x: number, y: number) => {
      if (mode === "draw_rectangle") {
        setRectStart([x, y]);
        setRectEnd([x, y]);
      }
    },
    [mode]
  );

  const handleRectMouseMove = useCallback(
    (x: number, y: number) => {
      if (mode === "draw_rectangle" && rectStart) {
        setRectEnd([x, y]);
      }
    },
    [mode, rectStart]
  );

  const handleRectMouseUp = useCallback(() => {
    if (mode === "draw_rectangle" && rectStart && rectEnd) {
      const pts = rectToPolygonPoints(
        rectStart[0], rectStart[1],
        rectEnd[0], rectEnd[1]
      );
      finalizeShape(pts);
      setRectStart(null);
      setRectEnd(null);
    }
  }, [mode, rectStart, rectEnd, finalizeShape]);

  /* ── Circle drag ── */
  const handleCircleMouseDown = useCallback(
    (x: number, y: number) => {
      if (mode === "draw_circle") {
        setCircleCenter([x, y]);
        setCircleEdge([x, y]);
      }
    },
    [mode]
  );

  const handleCircleMouseMove = useCallback(
    (x: number, y: number) => {
      if (mode === "draw_circle" && circleCenter) {
        setCircleEdge([x, y]);
      }
    },
    [mode, circleCenter]
  );

  const handleCircleMouseUp = useCallback(() => {
    if (mode === "draw_circle" && circleCenter && circleEdge) {
      const r = calcDistance(circleCenter, circleEdge);
      if (r < 5) return; // too small
      const pts = circleToPolygonPoints(circleCenter[0], circleCenter[1], r);
      finalizeShape(pts);
      setCircleCenter(null);
      setCircleEdge(null);
    }
  }, [mode, circleCenter, circleEdge, finalizeShape]);

  /* ── Path endpoint click (room or node) ── */
  const handlePathEndpointClick = useCallback(
    (
      endpointType: "room" | "node",
      name: string,
      point: [number, number],
      e: React.MouseEvent
    ) => {
      if (mode !== "draw_path") return;
      e.stopPropagation();

      if (!pathStart) {
        setPathStart({ type: endpointType, ref: name, point });
      } else {
        // Finalize path
        const dist = calcDistance(pathStart.point, point);
        const p: EditorPath = {
          id: genId(),
          start_type: pathStart.type,
          start_ref: pathStart.ref,
          end_type: endpointType,
          end_ref: name,
          distance: Math.round(dist * 100) / 100,
          floor: currentFloor,
          points: [pathStart.point, point],
        };
        setPaths((prev) => [...prev, p]);
        setPathStart(null);
        changeMode("select");
        setSelection({ type: "path", id: p.id });
      }
    },
    [mode, pathStart, currentFloor, changeMode]
  );

  /* ── Item selection click ── */
  const handleItemClick = useCallback(
    (type: SelectionState["type"], id: string, e: React.MouseEvent) => {
      if (mode === "select") {
        e.stopPropagation();
        setSelection({ type, id });
      }
    },
    [mode]
  );

  /* ── Node click (for paths OR selection) ── */
  const handleNodeClick = useCallback(
    (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (mode === "draw_path") {
        const n = nodes.find((nd) => nd.id === id);
        if (n) {
          handlePathEndpointClick("node", n.name, [n.x, n.y], e);
        }
      } else if (mode === "select") {
        setSelection({ type: "node", id });
      }
    },
    [mode, nodes, handlePathEndpointClick]
  );

  /* ── Room click (for paths OR selection) ── */
  const handleRoomClick = useCallback(
    (buildingId: string, roomId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      const building = buildings.find((b) => b.id === buildingId);
      const room = building?.rooms.find((r) => r.id === roomId);
      if (!room) return;

      if (mode === "draw_path") {
        const center = polygonCentroid(room.points);
        handlePathEndpointClick("room", room.name, center, e);
      } else if (mode === "select") {
        setSelection({ type: "room", id: roomId });
      }
    },
    [mode, buildings, handlePathEndpointClick]
  );

  /* ── Update helpers ── */
  const updateBuilding = (id: string, updates: Partial<EditorBuilding>) =>
    setBuildings((p) =>
      p.map((b) => (b.id === id ? { ...b, ...updates } : b))
    );

  const updateRoom = (
    buildingId: string,
    roomId: string,
    updates: Partial<EditorRoom>
  ) =>
    setBuildings((p) =>
      p.map((b) =>
        b.id === buildingId
          ? {
            ...b,
            rooms: b.rooms.map((r) =>
              r.id === roomId ? { ...r, ...updates } : r
            ),
          }
          : b
      )
    );

  const updateNode = (id: string, updates: Partial<EditorNode>) =>
    setNodes((p) => p.map((n) => (n.id === id ? { ...n, ...updates } : n)));

  /* ── Delete ── */
  const deleteSelection = useCallback(() => {
    if (!selection.id || !selection.type) return;
    const { id, type } = selection;

    if (type === "building") {
      setBuildings((p) => p.filter((b) => b.id !== id));
    }
    if (type === "room") {
      setBuildings((p) =>
        p.map((b) => ({
          ...b,
          rooms: b.rooms.filter((r) => r.id !== id),
        }))
      );
    }
    if (type === "node") {
      setNodes((p) => p.filter((n) => n.id !== id));
      // Also remove paths referencing this node by name
      const nodeName = nodes.find((n) => n.id === id)?.name;
      if (nodeName) {
        setPaths((p) =>
          p.filter(
            (pth) =>
              !(
                (pth.start_type === "node" && pth.start_ref === nodeName) ||
                (pth.end_type === "node" && pth.end_ref === nodeName)
              )
          )
        );
      }
    }
    if (type === "path") setPaths((p) => p.filter((pth) => pth.id !== id));

    setSelection({ type: null, id: null });
  }, [selection, nodes]);

  /* ── Dragging: nodes ── */
  const [draggingNode, setDraggingNode] = useState<string | null>(null);

  const startDragNode = (id: string, e: React.MouseEvent) => {
    if (mode === "select") {
      e.stopPropagation();
      setDraggingNode(id);
      setSelection({ type: "node", id });
    }
  };
  const onDragNode = (x: number, y: number) => {
    if (draggingNode) updateNode(draggingNode, { x, y });
  };
  const stopDragNode = () => setDraggingNode(null);

  /* ── Dragging: shapes ── */
  const [draggingShape, setDraggingShape] = useState<{
    id: string;
    type: "building" | "room";
    buildingId?: string;
    startPt: [number, number];
    startCoords: [number, number][];
  } | null>(null);

  const startDragShape = (
    type: "building" | "room",
    id: string,
    startX: number,
    startY: number,
    e: React.MouseEvent,
    buildingId?: string
  ) => {
    if (mode === "select") {
      e.stopPropagation();
      setSelection({ type, id });
      let coords: [number, number][] = [];
      if (type === "building") {
        coords = buildings.find((b) => b.id === id)?.points || [];
      } else if (buildingId) {
        coords =
          buildings
            .find((b) => b.id === buildingId)
            ?.rooms.find((r) => r.id === id)?.points || [];
      }
      setDraggingShape({
        id,
        type,
        buildingId,
        startPt: [startX, startY],
        startCoords: JSON.parse(JSON.stringify(coords)),
      });
    }
  };

  const onDragShape = (x: number, y: number) => {
    if (!draggingShape) return;
    const dx = x - draggingShape.startPt[0];
    const dy = y - draggingShape.startPt[1];
    const newCoords = draggingShape.startCoords.map(
      (pt) => [pt[0] + dx, pt[1] + dy] as [number, number]
    );
    if (draggingShape.type === "building") {
      updateBuilding(draggingShape.id, { points: newCoords });
    } else if (draggingShape.buildingId) {
      updateRoom(draggingShape.buildingId, draggingShape.id, {
        points: newCoords,
      });
    }
  };

  const stopDragShape = () => setDraggingShape(null);

  /* ── Find parent building for a room id ── */
  const findRoomParent = (roomId: string) =>
    buildings.find((b) => b.rooms.some((r) => r.id === roomId));

  /* ── Export data matching MapCreate schema ── */
  const getExportData = () => ({
    name: mapInfo.name,
    user_email: mapInfo.user_email,
    buildings: buildings.map((b) => ({
      name: b.name,
      floor: b.floor,
      geometry: polygonToWKT(b.points),
      rooms: b.rooms.map((r) => ({
        name: r.name,
        floor: r.floor,
        geometry: polygonToWKT(r.points),
      })),
    })),
    nodes: nodes.map((n) => ({
      name: n.name,
      floor: n.floor,
      node_type: n.node_type,
      geometry: pointToWKT(n.x, n.y),
    })),
    paths: paths.map((p) => ({
      start_type: p.start_type,
      start_ref: p.start_ref,
      end_type: p.end_type,
      end_ref: p.end_ref,
      distance: p.distance,
      geometry: lineToWKT(p.points),
      floor: p.floor,
    })),
  });

  return {
    // Map info
    mapInfo,
    setMapInfo: updateMapInfo,

    // Entities
    buildings,
    nodes,
    paths,

    // Editor state
    mode,
    changeMode,
    drawTarget,
    setDrawTarget,
    currentFloor,
    setCurrentFloor,
    floorUp,
    floorDown,
    selection,
    setSelection,

    // Layers
    layersVisible,
    toggleLayer,

    // Drawing intermediates
    activePolygon,
    rectStart,
    rectEnd,
    circleCenter,
    circleEdge,
    pathStart,

    // Event handlers
    handleCanvasClick,
    handleCanvasDoubleClick,
    handleNodeClick,
    handleRoomClick,
    handleItemClick,
    handlePathEndpointClick,

    // Rectangle
    handleRectMouseDown,
    handleRectMouseMove,
    handleRectMouseUp,

    // Circle
    handleCircleMouseDown,
    handleCircleMouseMove,
    handleCircleMouseUp,

    // Updaters
    updateBuilding,
    updateRoom,
    updateNode,
    deleteSelection,
    findRoomParent,

    // Export
    getExportData,

    // Dragging
    startDragNode,
    onDragNode,
    stopDragNode,
    startDragShape,
    onDragShape,
    stopDragShape,
    draggingNode: !!draggingNode,
  };
}
