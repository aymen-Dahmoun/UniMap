export type MapGeometry = {
  type: string;
  coordinates: unknown;
};

export type MapFeature = {
  type: "Feature";
  geometry: MapGeometry;
  properties: Record<string, unknown>;
};

export type MapData = {
  buildings: MapFeature[];
  rooms: MapFeature[];
  nodes: MapFeature[];
  paths: MapFeature[];
};

export type Selection = {
  id: string;
  type: "room" | "node";
  properties: Record<string, unknown>;
};
