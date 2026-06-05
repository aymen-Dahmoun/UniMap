import React, { useState } from "react";
import type {
  EditorMapInfo,
  SelectionState,
  EditorBuilding,
  EditorNode,
  EditorPath,
  NodeType,
} from "./types";
import { NODE_TYPES } from "./types";

interface PropertiesPanelProps {
  mapInfo: EditorMapInfo;
  setMapInfo: (info: Partial<EditorMapInfo>) => void;
  selection: SelectionState;
  buildings: EditorBuilding[];
  nodes: EditorNode[];
  paths: EditorPath[];
  updateBuilding: (id: string, updates: Partial<EditorBuilding>) => void;
  updateRoom: (buildingId: string, roomId: string, updates: Partial<import("./types").EditorRoom>) => void;
  updateNode: (id: string, updates: Partial<EditorNode>) => void;
  findRoomParent: (roomId: string) => EditorBuilding | undefined;
  deleteSelection: () => void;
  onSave: () => void;
  isSaving: boolean;
  getExportData: () => unknown;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  mapInfo,
  setMapInfo,
  selection,
  buildings,
  nodes,
  paths,
  updateBuilding,
  updateRoom,
  updateNode,
  findRoomParent,
  deleteSelection,
  onSave,
  isSaving,
  getExportData,
}) => {
  const [showJson, setShowJson] = useState(false);

  const inputClass =
    "w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500";

  const renderSelectionProperties = () => {
    if (!selection.id || !selection.type)
      return <div className="text-sm text-gray-500 italic p-4">No item selected.</div>;

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
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Floor</label>
            <input
              type="number"
              value={b.floor}
              onChange={(e) => updateBuilding(b.id, { floor: parseInt(e.target.value) || 0 })}
              className={inputClass}
            />
          </div>
          <div className="text-xs text-gray-400">
            Rooms: {b.rooms.length} &middot; Vertices: {b.points.length}
          </div>
          <button onClick={deleteSelection} className="text-xs text-red-600 hover:text-red-800 font-medium">
            Delete Building
          </button>
        </div>
      );
    }

    if (selection.type === "room") {
      const parent = findRoomParent(selection.id);
      const r = parent?.rooms.find((x) => x.id === selection.id);
      if (!r || !parent) return null;
      return (
        <div className="p-4 border-b border-gray-200 space-y-3">
          <h4 className="font-semibold text-gray-700">Room Properties</h4>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
            <input
              type="text"
              value={r.name}
              onChange={(e) => updateRoom(parent.id, r.id, { name: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Floor</label>
            <input
              type="number"
              value={r.floor}
              onChange={(e) => updateRoom(parent.id, r.id, { floor: parseInt(e.target.value) || 0 })}
              className={inputClass}
            />
          </div>
          <div className="text-xs text-gray-400">
            Building: {parent.name} &middot; Vertices: {r.points.length}
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
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
            <input
              type="text"
              value={n.name}
              onChange={(e) => updateNode(n.id, { name: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
            <select
              value={n.node_type}
              onChange={(e) => updateNode(n.id, { node_type: e.target.value as NodeType })}
              className={inputClass}
            >
              {NODE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Floor</label>
            <input
              type="number"
              value={n.floor}
              onChange={(e) => updateNode(n.id, { floor: parseInt(e.target.value) || 0 })}
              className={inputClass}
            />
          </div>
          <div className="text-xs text-gray-400">
            X: {n.x.toFixed(1)} &middot; Y: {n.y.toFixed(1)}
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
          <div className="text-sm text-gray-600">
            <span className="text-xs uppercase text-gray-400">From:</span>{" "}
            {p.start_type} → <b>{p.start_ref}</b>
          </div>
          <div className="text-sm text-gray-600">
            <span className="text-xs uppercase text-gray-400">To:</span>{" "}
            {p.end_type} → <b>{p.end_ref}</b>
          </div>
          <div className="text-sm text-gray-600">
            <span className="text-xs uppercase text-gray-400">Distance:</span>{" "}
            {p.distance}
          </div>
          <div className="text-sm text-gray-600">
            <span className="text-xs uppercase text-gray-400">Floor:</span>{" "}
            {p.floor}
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
      {/* Map details */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wide">Map Details</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Map Name *</label>
            <input
              type="text"
              value={mapInfo.name}
              onChange={(e) => setMapInfo({ name: e.target.value })}
              className={inputClass}
              placeholder="e.g. Main Campus"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">User Email *</label>
            <input
              type="email"
              value={mapInfo.user_email}
              onChange={(e) => setMapInfo({ user_email: e.target.value })}
              className={inputClass}
              placeholder="admin@unimap.com"
            />
          </div>
          <button
            onClick={onSave}
            disabled={isSaving || !mapInfo.name || !mapInfo.user_email}
            className={`w-full py-2 px-4 rounded text-sm font-medium text-white transition-colors ${isSaving || !mapInfo.name || !mapInfo.user_email
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
              }`}
          >
            {isSaving ? "Saving..." : "Create Map"}
          </button>
          <button
            onClick={() => setShowJson(!showJson)}
            className="w-full py-1.5 px-4 rounded text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            {showJson ? "Hide" : "Preview"} JSON
          </button>
        </div>
      </div>

      {/* JSON preview */}
      {showJson && (
        <div className="p-4 border-b border-gray-200 bg-gray-900 max-h-64 overflow-auto">
          <pre className="text-xs text-green-400 whitespace-pre-wrap font-mono">
            {JSON.stringify(getExportData(), null, 2)}
          </pre>
        </div>
      )}

      {/* Selection properties */}
      <div className="flex-1">{renderSelectionProperties()}</div>

      {/* Summary */}
      <div className="p-4 border-t border-gray-200 text-xs text-gray-400 space-y-1">
        <div>Buildings: {buildings.length}</div>
        <div>Rooms: {buildings.reduce((s, b) => s + b.rooms.length, 0)}</div>
        <div>Nodes: {nodes.length}</div>
        <div>Paths: {paths.length}</div>
      </div>
    </div>
  );
};
