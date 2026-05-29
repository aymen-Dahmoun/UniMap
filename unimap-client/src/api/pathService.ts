import { API_BASE } from './mapService';

export async function fetchPath(startType: string, startId: string, endType: string, endId: string) {
  const params = new URLSearchParams({
    start_type: startType,
    start_id: startId,
    end_type: endType,
    end_id: endId,
  });
  const response = await fetch(`${API_BASE}/path/shortest?${params.toString()}`);
  if (!response.ok) throw new Error("Failed to fetch path");
  return response.json();
}
