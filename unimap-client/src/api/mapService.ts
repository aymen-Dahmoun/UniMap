export const API_BASE = "http://localhost:8000/api";
export async function fetchMapLayer(layer: string) {
  const response = await fetch(`${API_BASE}/${layer}/`);
  if (!response.ok) throw new Error(`Failed to fetch ${layer}`);
  return response.json();
}
