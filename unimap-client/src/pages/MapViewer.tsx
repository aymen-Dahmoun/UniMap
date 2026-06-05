import { useState, useMemo } from 'react';
import { useFetchMap } from '../hooks/useFetchMap';
import { usePathQuery } from '../hooks/usePathQuery';
import { MapCanvas } from '../components/MapCanvas';
import { SidePanel } from '../components/SidePanel';
import { PathTrace } from '../components/PathTrace';
import { SearchBar } from '../components/SearchBar';
import type { MapFeature } from '../models/types';
import { Link } from 'react-router-dom';

export function MapViewer() {
  const [currentMapId, setCurrentMapId] = useState<number | null>(null);

  const { data, loading: mapLoading, error: mapError } = useFetchMap(currentMapId);
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

  const handleSelectMap = (mapId: number) => {
    setCurrentMapId(mapId);
  };

  const handleSelectNode = (nodeId: string, type: 'room' | 'node', floor: number) => {
    const feature = type === 'room' ? featureLookup.rooms.get(nodeId) : featureLookup.nodes.get(nodeId);
    if (feature) {
      handleSelect(nodeId, feature, type);
      setCurrentFloor(String(floor));
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', fontFamily: 'sans-serif', flexDirection: 'column' }}>
      <div className="bg-blue-600 text-white flex justify-between items-center px-4 py-2 flex-shrink-0">
        <h1 className="font-bold text-xl">UniMap Viewer</h1>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <SearchBar
            currentMapId={currentMapId}
            onSelectMap={handleSelectMap}
            onSelectNode={handleSelectNode}
          />
        </div>
        <div>
          <Link to="/editor" className="bg-white text-blue-600 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100 transition">
            Go to Editor
          </Link>
        </div>
      </div>
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {currentMapId !== null && (
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
        )}

        <div style={{ flex: 1, position: 'relative', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {currentMapId === null ? (
            <div style={{ textAlign: 'center', color: '#666' }}>
              <h2>Welcome to UniMap</h2>
              <p>Please use the search bar above to select a map.</p>
            </div>
          ) : (
            <>
              <MapCanvas
                data={data}
                pathSegments={pathSegments}
                selectedId={selectedFeature?.id}
                onSelect={handleSelect}
                currentFloor={currentFloor}
              />
              <PathTrace points={pathPoints} featureLookup={featureLookup} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default MapViewer;