export interface MapPayload {
  name: string;
  email: string;
  buildings: { name: string; coordinates: [number, number][] }[];
  rooms: { name: string; building_id: string; coordinates: [number, number][] }[];
  nodes: { id: string; x: number; y: number }[];
  paths: { start_node: string; end_node: string }[];
}

export const createMap = async (payload: MapPayload): Promise<void> => {
  const response = await fetch("/maps/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  
  if (!response.ok) {
    throw new Error("Failed to save map.");
  }
};
