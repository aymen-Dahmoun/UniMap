export const NODE_TYPES = [
  "normal", "stairs", "elevator", "entrance", "exit",
  "emergency_exit", "restroom", "accessible", "public_chair",
  "info", "desk", "tree", "bench",
] as const;

export type NodeType = (typeof NODE_TYPES)[number];

export type EditorRoom = {
  id: string;
  name: string;
  floor: number;
  points: [number, number][];
};

export type EditorBuilding = {
  id: string;
  name: string;
  floor: number;
  points: [number, number][];
  rooms: EditorRoom[];
};

export type EditorNode = {
  id: string;
  name: string;
  floor: number;
  x: number;
  y: number;
  node_type: NodeType;
};

export type EditorPath = {
  id: string;
  start_type: "room" | "node";
  start_ref: string;
  end_type: "room" | "node";
  end_ref: string;
  distance: number;
  floor: number;
  /** polyline points for the geometry */
  points: [number, number][];
};

export type EditorMapInfo = {
  name: string;
  user_email: string;
};

export type DrawTarget = "building" | "room";

export type EditorMode =
  | "select"
  | "draw_polygon"
  | "draw_rectangle"
  | "draw_circle"
  | "add_node"
  | "draw_path";

export type SelectionState = {
  type: "building" | "room" | "node" | "path" | null;
  id: string | null;
};
