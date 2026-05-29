import { useState, useMemo } from 'react';
import { useFetchMap } from './hooks/useFetchMap';
import { usePathQuery } from './hooks/usePathQuery';
import { MapCanvas } from './components/MapCanvas';
import type { MapFeature } from './models/types';

export function App() {
  const { data, loading: mapLoading, error: mapError } = useFetchMap();
  const { pathSegments, loading: pathLoading, error: pathError, queryPath, clearPath } = usePathQuery();

  const [currentFloor, setCurrentFloor] = useState<string>('all');
  const [selectedFeature, setSelectedFeature] = useState<{ id: string, feature: MapFeature, type: "room" | "node" } | null>(null);

  const [startPoint, setStartPoint] = useState<{ id: string, type: "room" | "node" } | null>(null);
  const [endPoint, setEndPoint] = useState<{ id: string, type: "room" | "node" } | null>(null);

  const allFloors = useMemo(() => {
    const floors = new Set<string>();
    const process = (f: MapFeature) => {
      if (f.properties?.floor != null) floors.add(String(f.properties.floor));
    };
    data.buildings.forEach(process);
    data.rooms.forEach(process);
    data.nodes.forEach(process);
    data.paths.forEach(process);
    return Array.from(floors).sort((a, b) => Number(a) - Number(b));
  }, [data]);

  const handleSelect = (id: string, feature: MapFeature, type: "room" | "node") => {
    setSelectedFeature({ id, feature, type });
  };

  const handleSetStart = () => {
    if (selectedFeature) setStartPoint({ id: selectedFeature.id, type: selectedFeature.type });
  };

  const handleSetEnd = () => {
    if (selectedFeature) setEndPoint({ id: selectedFeature.id, type: selectedFeature.type });
  };

  const handleFindPath = () => {
    if (startPoint && endPoint) {
      queryPath(startPoint.type, startPoint.id, endPoint.type, endPoint.id);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', fontFamily: 'sans-serif' }}>
      {/* Side Panel */}
      <div style={{ width: '300px', backgroundColor: '#f8fafc', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', padding: '16px', gap: '16px', zIndex: 10, boxShadow: '2px 0 5px rgba(0,0,0,0.1)' }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>UniMap</h1>
        
        {mapLoading && <div>Loading map...</div>}
        {mapError && <div style={{ color: 'red' }}>Error: {mapError}</div>}

        {!mapLoading && !mapError && (
          <>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Floor</label>
              <select value={currentFloor} onChange={(e) => setCurrentFloor(e.target.value)} style={{ width: '100%', padding: '8px' }}>
                <option value="all">All Floors</option>
                {allFloors.map(f => <option key={f} value={f}>Floor {f}</option>)}
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
                    <button onClick={handleSetStart} style={{ padding: '6px 12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', flex: 1 }}>Set Start</button>
                    <button onClick={handleSetEnd} style={{ padding: '6px 12px', backgroundColor: '#eab308', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', flex: 1 }}>Set End</button>
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
                <button onClick={handleFindPath} disabled={!startPoint || !endPoint || pathLoading} style={{ padding: '8px 0', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', flex: 1, opacity: (!startPoint || !endPoint) ? 0.5 : 1 }}>
                  {pathLoading ? 'Finding...' : 'Find Path'}
                </button>
                <button onClick={clearPath} style={{ padding: '8px 0', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', flex: 1 }}>Clear</button>
              </div>
              {pathError && <div style={{ color: 'red', marginTop: '8px', fontSize: '12px' }}>{pathError}</div>}
            </div>
          </>
        )}
      </div>

      {/* Main Map Area */}
      <div style={{ flex: 1, position: 'relative', backgroundColor: 'white' }}>
        <MapCanvas
          data={data}
          pathSegments={pathSegments}
          selectedId={selectedFeature?.id}
          onSelect={handleSelect}
          currentFloor={currentFloor}
        />
      </div>
    </div>
  );
}

export default App;
