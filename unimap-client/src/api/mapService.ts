export const API_BASE = "http://localhost:8000/api";
export async function fetchMapLayer(layer: string) {
  const response = await fetch(`${API_BASE}/${layer}/`);
  if (!response.ok) throw new Error(`Failed to fetch ${layer}`);
  return response.json();
}

export async function searchMaps(query: string = "") {
  const url = new URL(`${API_BASE}/search/maps`);
  if (query) url.searchParams.append("q", query);
  const response = await fetch(url.toString());
  if (!response.ok) throw new Error("Failed to search maps");
  return response.json();
}

export async function searchMapNodes(mapId: number, query: string, floor?: number) {
  const url = new URL(`${API_BASE}/search/maps/${mapId}/nodes`);
  if (query) url.searchParams.append("q", query);
  if (floor !== undefined) url.searchParams.append("floor", floor.toString());
  const response = await fetch(url.toString());
  if (!response.ok) throw new Error("Failed to search map nodes");
  return response.json();
}

export async function getMap(mapId: number) {
  const response = await fetch(`${API_BASE}/maps/${mapId}`);
  if (!response.ok) throw new Error("Failed to get map");
  return response.json();
}
