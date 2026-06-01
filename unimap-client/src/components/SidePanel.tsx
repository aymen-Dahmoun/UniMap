import type { MapFeature } from '../models/types';

interface SidePanelProps {
  mapLoading: boolean;
  mapError: string | null;
  currentFloor: string;
  floors: string[];
  onFloorChange: (floor: string) => void;
  selectedFeature: { id: string; feature: MapFeature; type: 'room' | 'node' } | null;
  onSetStart: () => void;
  onSetEnd: () => void;
  startPoint: { id: string; type: 'room' | 'node' } | null;
  endPoint: { id: string; type: 'room' | 'node' } | null;
  onFindPath: () => void;
  onClearPath: () => void;
  pathLoading: boolean;
  pathError: string | null;
}

export function SidePanel({
  mapLoading,
  mapError,
  currentFloor,
  floors,
  onFloorChange,
  selectedFeature,
  onSetStart,
  onSetEnd,
  startPoint,
  endPoint,
  onFindPath,
  onClearPath,
  pathLoading,
  pathError
}: SidePanelProps) {
  return (
    <div style={{ width: '300px', backgroundColor: '#f8fafc', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', padding: '16px', gap: '16px', zIndex: 10, boxShadow: '2px 0 5px rgba(0,0,0,0.1)' }}>
      <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>UniMap</h1>

      {mapLoading && <div>Loading map...</div>}
      {mapError && <div style={{ color: 'red' }}>Error: {mapError}</div>}

      {!mapLoading && !mapError && (
        <>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Floor</label>
            <select value={currentFloor} onChange={(e) => onFloorChange(e.target.value)} style={{ width: '100%', padding: '8px' }}>
              <option value="all">All Floors</option>
              {floors.map(f => <option key={f} value={f}>Floor {f}</option>)}
            </select>
          </div>

          <div style={{ border: '1px solid #cbd5e1', padding: '12px', borderRadius: '8px', backgroundColor: 'white' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Selection</h3>
            {selectedFeature ? (
              <div>
                <div style={{ marginBottom: '4px' }}><strong>Type:</strong> {selectedFeature.type}</div>
                <div style={{ marginBottom: '12px', wordBreak: 'break-all' }}>
                  {Object.entries(selectedFeature.feature.properties).map(([k, v]) => (
                    <div key={k}><strong>{k}:</strong> {String(v)}</div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={onSetStart} style={{ padding: '6px 12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', flex: 1 }}>Set Start</button>
                  <button onClick={onSetEnd} style={{ padding: '6px 12px', backgroundColor: '#eab308', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', flex: 1 }}>Set End</button>
                </div>
              </div>
            ) : (
              <div style={{ color: '#64748b' }}>Click a room or node on the map.</div>
            )}
          </div>

          <div style={{ border: '1px solid #cbd5e1', padding: '12px', borderRadius: '8px', backgroundColor: 'white' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Pathfinding</h3>
            <div style={{ marginBottom: '8px' }}>
              <strong>Start:</strong> {startPoint ? `${startPoint.type} ${startPoint.id}` : 'None'}
            </div>
            <div style={{ marginBottom: '12px' }}>
              <strong>End:</strong> {endPoint ? `${endPoint.type} ${endPoint.id}` : 'None'}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={onFindPath} disabled={!startPoint || !endPoint || pathLoading} style={{ padding: '8px 0', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', flex: 1, opacity: (!startPoint || !endPoint) ? 0.5 : 1 }}>
                {pathLoading ? 'Finding...' : 'Find Path'}
              </button>
              <button onClick={onClearPath} style={{ padding: '8px 0', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', flex: 1 }}>Clear</button>
            </div>
            {pathError && <div style={{ color: 'red', marginTop: '8px', fontSize: '12px' }}>{pathError}</div>}
          </div>

        </>
      )}
    </div>
  );
}
