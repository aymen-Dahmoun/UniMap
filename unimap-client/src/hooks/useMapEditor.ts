import { useState } from "react";
import type {
  EditorBuilding,
  EditorRoom,
  EditorNode,
  EditorPath,
  EditorMapInfo,
  EditorMode,
  SelectionState,
} from "../components/MapEditor/types";

export function useMapEditor() {
  const [mapInfo, setMapInfo] = useState<EditorMapInfo>({
    name: "",
    email: "",
    description: "",
  });

  const [buildings, setBuildings] = useState<EditorBuilding[]>([]);
  const [rooms, setRooms] = useState<EditorRoom[]>([]);
  const [nodes, setNodes] = useState<EditorNode[]>([]);
  const [paths, setPaths] = useState<EditorPath[]>([]);

  const [mode, setMode] = useState<EditorMode>("select");
  const [selection, setSelection] = useState<SelectionState>({ type: null, id: null });

  // Layers visibility
  const [layersVisible, setLayersVisible] = useState({
    buildings: true,
    rooms: true,
    nodes: true,
    paths: true,
  });

  // Intermediate drawing states
  const [activePolygon, setActivePolygon] = useState<[number, number][]>([]);
  const [activePathStartNode, setActivePathStartNode] = useState<string | null>(null);

  const toggleLayer = (layer: keyof typeof layersVisible) => {
    setLayersVisible((prev) => ({ ...prev, [layer]: !prev[layer] }));
  };

  const generateId = () => crypto.randomUUID();

  // Mode changes
  const changeMode = (newMode: EditorMode) => {
    setMode(newMode);
    setActivePolygon([]);
    setActivePathStartNode(null);
    if (newMode !== "select") {
      // Keep selection if setting room, because room needs a building selected
      if (newMode !== "draw_room") {
        setSelection({ type: null, id: null });
      }
    }
  };

  const handleCanvasClick = (x: number, y: number) => {
    if (mode === "draw_building" || mode === "draw_room") {
      setActivePolygon((prev) => [...prev, [x, y]]);
    } else if (mode === "add_node") {
      const newNode: EditorNode = {
        id: generateId(),
        x,
        y,
      };
      setNodes((prev) => [...prev, newNode]);
      changeMode("select");
      setSelection({ type: "node", id: newNode.id });
    } else if (mode === "select") {
      setSelection({ type: null, id: null });
    }
  };

  const handleCanvasDoubleClick = () => {
    if (mode === "draw_building" && activePolygon.length >= 3) {
      const newBuilding: EditorBuilding = {
        id: generateId(),
        name: "New Building",
        coordinates: activePolygon,
      };
      setBuildings((prev) => [...prev, newBuilding]);
      changeMode("select");
      setSelection({ type: "building", id: newBuilding.id });
    } else if (mode === "draw_room" && activePolygon.length >= 3) {
      if (selection.type === "building" && selection.id) {
        const newRoom: EditorRoom = {
          id: generateId(),
          building_id: selection.id,
          name: "New Room",
          coordinates: activePolygon,
        };
        setRooms((prev) => [...prev, newRoom]);
        changeMode("select");
        setSelection({ type: "room", id: newRoom.id });
      } else {
        alert("Please select a building before drawing a room.");
        changeMode("select");
      }
    }
  };

  const handleNodeClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (mode === "connect_nodes") {
      if (!activePathStartNode) {
        setActivePathStartNode(id);
      } else if (activePathStartNode !== id) {
        const newPath: EditorPath = {
          id: generateId(),
          start_node: activePathStartNode,
          end_node: id,
        };
        setPaths((prev) => [...prev, newPath]);
        setActivePathStartNode(null);
        changeMode("select");
        setSelection({ type: "path", id: newPath.id });
      }
    } else if (mode === "select") {
      setSelection({ type: "node", id });
    }
  };

  const handleItemClick = (type: SelectionState["type"], id: string, e: React.MouseEvent) => {
    if (mode === "select" || (mode === "draw_room" && type === "building")) {
      e.stopPropagation();
      setSelection({ type, id });
    }
  };

  // Updaters for properties
  const updateMapInfo = (updates: Partial<EditorMapInfo>) => setMapInfo(p => ({ ...p, ...updates }));
  const updateBuilding = (id: string, updates: Partial<EditorBuilding>) =>
    setBuildings(p => p.map(b => (b.id === id ? { ...b, ...updates } : b)));
  const updateRoom = (id: string, updates: Partial<EditorRoom>) =>
    setRooms(p => p.map(r => (r.id === id ? { ...r, ...updates } : r)));
  const updateNode = (id: string, updates: Partial<EditorNode>) =>
    setNodes(p => p.map(n => (n.id === id ? { ...n, ...updates } : n)));

  const deleteSelection = () => {
    if (!selection.id || !selection.type) return;
    const { id, type } = selection;
    if (type === "building") {
      setBuildings(p => p.filter(b => b.id !== id));
      setRooms(p => p.filter(r => r.building_id !== id));
    }
    if (type === "room") setRooms(p => p.filter(r => r.id !== id));
    if (type === "node") {
      setNodes(p => p.filter(n => n.id !== id));
      setPaths(p => p.filter(pth => pth.start_node !== id && pth.end_node !== id));
    }
    if (type === "path") setPaths(p => p.filter(pth => pth.id !== id));
    
    setSelection({ type: null, id: null });
  };

  // Node Dragging
  const [draggingNode, setDraggingNode] = useState<string | null>(null);

  const startDragNode = (id: string, e: React.MouseEvent) => {
    if (mode === "select") {
      e.stopPropagation();
      setDraggingNode(id);
      setSelection({ type: "node", id });
    }
  };

  const onDragNode = (x: number, y: number) => {
    if (draggingNode) {
      updateNode(draggingNode, { x, y });
    }
  };

  const stopDragNode = () => {
    setDraggingNode(null);
  };

  // Building / Room Moving (simplified: calculate delta and apply to all coords)
  const [draggingShape, setDraggingShape] = useState<{ id: string, type: "building" | "room", startPt: [number, number], startCoords: [number, number][] } | null>(null);

  const startDragShape = (type: "building" | "room", id: string, startX: number, startY: number, e: React.MouseEvent) => {
    if (mode === "select") {
      e.stopPropagation();
      setSelection({ type, id });
      const shape = type === "building" ? buildings.find(b => b.id === id) : rooms.find(r => r.id === id);
      if (shape) {
        setDraggingShape({
          id,
          type,
          startPt: [startX, startY],
          startCoords: JSON.parse(JSON.stringify(shape.coordinates))
        });
      }
    }
  };

  const onDragShape = (x: number, y: number) => {
    if (draggingShape) {
      const dx = x - draggingShape.startPt[0];
      const dy = y - draggingShape.startPt[1];
      const newCoords = draggingShape.startCoords.map(pt => [pt[0] + dx, pt[1] + dy] as [number, number]);
      if (draggingShape.type === "building") updateBuilding(draggingShape.id, { coordinates: newCoords });
      else updateRoom(draggingShape.id, { coordinates: newCoords });
    }
  };

  const stopDragShape = () => {
    setDraggingShape(null);
  };

  const getExportData = () => {
    return {
      name: mapInfo.name,
      email: mapInfo.email,
      buildings: buildings.map(b => ({
        name: b.name,
        coordinates: b.coordinates
      })),
      rooms: rooms.map(r => ({
        name: r.name,
        building_id: r.building_id,
        coordinates: r.coordinates
      })),
      nodes: nodes.map(n => ({
        id: n.id,
        x: n.x,
        y: n.y
      })),
      paths: paths.map(p => ({
        start_node: p.start_node,
        end_node: p.end_node
      }))
    };
  };

  return {
    mapInfo, setMapInfo: updateMapInfo,
    buildings, setBuildings,
    rooms, setRooms,
    nodes, setNodes,
    paths, setPaths,
    mode, changeMode,
    selection, setSelection,
    layersVisible, toggleLayer,
    activePolygon,
    activePathStartNode,
    handleCanvasClick,
    handleCanvasDoubleClick,
    handleNodeClick,
    handleItemClick,
    updateBuilding, updateRoom, updateNode,
    deleteSelection,
    getExportData,
    
    // Dragging
    startDragNode, onDragNode, stopDragNode,
    startDragShape, onDragShape, stopDragShape,
    draggingNode: !!draggingNode
  };
}
