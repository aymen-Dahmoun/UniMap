export type EditorBuilding = {
  id: string;
  name: string;
  coordinates: [number, number][];
};

export type EditorRoom = {
  id: string;
  building_id: string;
  name: string;
  coordinates: [number, number][];
};

export type EditorNode = {
  id: string;
  x: number;
  y: number;
};

export type EditorPath = {
  id: string;
  start_node: string;
  end_node: string;
};

export type EditorMapInfo = {
  name: string;
  email: string;
  description: string;
};

export type EditorMode = 
  | "select"
  | "draw_building"
  | "draw_room"
  | "add_node"
  | "connect_nodes";

export type SelectionState = {
  type: "building" | "room" | "node" | "path" | null;
  id: string | null;
};
