export interface RoomPayload {
  name: string;
  floor: number;
  geometry: string;
}

export interface BuildingPayload {
  name: string;
  floor: number;
  geometry: string;
  rooms: RoomPayload[];
}

export interface NodePayload {
  name: string;
  floor: number;
  node_type: string;
  geometry: string;
}

export interface PathPayload {
  start_type: string;
  start_ref: string;
  end_type: string;
  end_ref: string;
  distance: number;
  geometry: string;
  floor: number;
}

export interface MapPayload {
  name: string;
  user_email: string;
  buildings: BuildingPayload[];
  nodes: NodePayload[];
  paths: PathPayload[];
}

export const createMap = async (payload: MapPayload): Promise<void> => {
  const response = await fetch("http://localhost:8000/api/maps/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.detail || "Failed to save map.");
  }
};
