import { useState, useMemo } from 'react';
import { useFetchMap } from './hooks/useFetchMap';
import { usePathQuery } from './hooks/usePathQuery';
import { MapCanvas } from './components/MapCanvas';
import { SidePanel } from './components/SidePanel';
import { PathTrace } from './components/PathTrace';
import type { MapFeature } from './models/types';

export function App() {
  const { data, loading: mapLoading, error: mapError } = useFetchMap();
  const { pathSegments, pathPoints, loading: pathLoading, error: pathError, queryPath, clearPath } = usePathQuery();

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

  const featureLookup = useMemo(() => {
    const rooms = new Map<string, MapFeature>();
    const nodes = new Map<string, MapFeature>();
    data.rooms.forEach((r) => rooms.set(String(r.properties?.id), r));
    data.nodes.forEach((n) => nodes.set(String(n.properties?.id), n));
    return { rooms, nodes };
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
      <SidePanel
        mapLoading={mapLoading}
        mapError={mapError}
        currentFloor={currentFloor}
        floors={allFloors}
        onFloorChange={setCurrentFloor}
        selectedFeature={selectedFeature}
        onSetStart={handleSetStart}
        onSetEnd={handleSetEnd}
        startPoint={startPoint}
        endPoint={endPoint}
        onFindPath={handleFindPath}
        onClearPath={clearPath}
        pathLoading={pathLoading}
        pathError={pathError}
      />

      {/* Main Map Area */}
      <div style={{ flex: 1, position: 'relative', backgroundColor: 'white' }}>
        <MapCanvas
          data={data}
          pathSegments={pathSegments}
          selectedId={selectedFeature?.id}
          onSelect={handleSelect}
          currentFloor={currentFloor}
        />
        <PathTrace points={pathPoints} featureLookup={featureLookup} />
      </div>
    </div>
  );
}

export default App;
