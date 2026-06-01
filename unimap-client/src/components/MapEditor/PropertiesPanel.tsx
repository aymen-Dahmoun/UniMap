import React from "react";
import type { EditorMapInfo, SelectionState, EditorBuilding, EditorRoom, EditorNode, EditorPath } from "./types";

interface PropertiesPanelProps {
  mapInfo: EditorMapInfo;
  setMapInfo: (info: Partial<EditorMapInfo>) => void;
  selection: SelectionState;
  buildings: EditorBuilding[];
  rooms: EditorRoom[];
  nodes: EditorNode[];
  paths: EditorPath[];
  updateBuilding: (id: string, updates: Partial<EditorBuilding>) => void;
  updateRoom: (id: string, updates: Partial<EditorRoom>) => void;
  deleteSelection: () => void;
  onSave: () => void;
  isSaving: boolean;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  mapInfo,
  setMapInfo,
  selection,
  buildings,
  rooms,
  nodes,
  paths,
  updateBuilding,
  updateRoom,
  deleteSelection,
  onSave,
  isSaving,
}) => {
  const renderSelectionProperties = () => {
    if (!selection.id || !selection.type) {
      return <div className="text-sm text-gray-500 italic p-4">No item selected.</div>;
    }

    if (selection.type === "building") {
      const b = buildings.find((x) => x.id === selection.id);
      if (!b) return null;
      return (
        <div className="p-4 border-b border-gray-200 space-y-3">
          <h4 className="font-semibold text-gray-700">Building Properties</h4>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
            <input
              type="text"
              value={b.name}
              onChange={(e) => updateBuilding(b.id, { name: e.target.value })}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button onClick={deleteSelection} className="text-xs text-red-600 hover:text-red-800 font-medium">
            Delete Building
          </button>
        </div>
      );
    }

    if (selection.type === "room") {
      const r = rooms.find((x) => x.id === selection.id);
      if (!r) return null;
      return (
        <div className="p-4 border-b border-gray-200 space-y-3">
          <h4 className="font-semibold text-gray-700">Room Properties</h4>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
            <input
              type="text"
              value={r.name}
              onChange={(e) => updateRoom(r.id, { name: e.target.value })}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button onClick={deleteSelection} className="text-xs text-red-600 hover:text-red-800 font-medium">
            Delete Room
          </button>
        </div>
      );
    }

    if (selection.type === "node") {
      const n = nodes.find((x) => x.id === selection.id);
      if (!n) return null;
      return (
        <div className="p-4 border-b border-gray-200 space-y-3">
          <h4 className="font-semibold text-gray-700">Node Properties</h4>
          <div className="text-sm">
            X: {n.x.toFixed(2)}<br />
            Y: {n.y.toFixed(2)}
          </div>
          <button onClick={deleteSelection} className="text-xs text-red-600 hover:text-red-800 font-medium">
            Delete Node
          </button>
        </div>
      );
    }

    if (selection.type === "path") {
      const p = paths.find((x) => x.id === selection.id);
      if (!p) return null;
      return (
        <div className="p-4 border-b border-gray-200 space-y-3">
          <h4 className="font-semibold text-gray-700">Path Properties</h4>
          <div className="text-sm text-gray-600 truncate" title={p.start_node}>
            Start: {p.start_node.slice(0, 8)}...
          </div>
          <div className="text-sm text-gray-600 truncate" title={p.end_node}>
            End: {p.end_node.slice(0, 8)}...
          </div>
          <button onClick={deleteSelection} className="text-xs text-red-600 hover:text-red-800 font-medium">
            Delete Path
          </button>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="w-72 bg-white border-l border-gray-200 flex flex-col h-full overflow-y-auto">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wide">Map Details</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Map Name *</label>
            <input
              type="text"
              value={mapInfo.name}
              onChange={(e) => setMapInfo({ name: e.target.value })}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g. Main Campus"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Owner Email *</label>
            <input
              type="email"
              value={mapInfo.email}
              onChange={(e) => setMapInfo({ email: e.target.value })}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
              placeholder="admin@unimap.com"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Description (Optional)</label>
            <textarea
              value={mapInfo.description}
              onChange={(e) => setMapInfo({ description: e.target.value })}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
              rows={2}
            />
          </div>
          <button
            onClick={onSave}
            disabled={isSaving || !mapInfo.name || !mapInfo.email}
            className={`w-full py-2 px-4 rounded text-sm font-medium text-white transition-colors mt-2 ${
              isSaving || !mapInfo.name || !mapInfo.email
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isSaving ? "Saving..." : "Create Map"}
          </button>
        </div>
      </div>
      
      <div className="flex-1">
        {renderSelectionProperties()}
      </div>
    </div>
  );
};
