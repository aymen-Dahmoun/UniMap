import React from "react";
import type { EditorMode } from "./types";
import { Link } from "react-router-dom";

interface ToolbarProps {
  mode: EditorMode;
  changeMode: (mode: EditorMode) => void;
  layersVisible: { buildings: boolean; rooms: boolean; nodes: boolean; paths: boolean };
  toggleLayer: (layer: "buildings" | "rooms" | "nodes" | "paths") => void;
  hasBuildingSelected: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  mode,
  changeMode,
  layersVisible,
  toggleLayer,
  hasBuildingSelected,
}) => {
  const btnClass = (active: boolean, disabled: boolean = false) =>
    `px-4 py-2 text-sm font-medium rounded-md transition-colors ${
      disabled
        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
        : active
        ? "bg-blue-600 text-white"
        : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
    }`;

  return (
    <div className="flex flex-col gap-4 p-4 bg-gray-50 border-r border-gray-200 w-64 h-full overflow-y-auto">
      <div className="mb-2">
        <Link to="/" className="text-blue-600 hover:underline text-sm font-medium flex items-center gap-1">
          &larr; Back to Map Viewer
        </Link>
      </div>
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Tools</h3>
        <div className="flex flex-col gap-2">
          <button className={btnClass(mode === "select")} onClick={() => changeMode("select")}>
            Select / Move
          </button>
          <button className={btnClass(mode === "draw_building")} onClick={() => changeMode("draw_building")}>
            Draw Building
          </button>
          <button
            className={btnClass(mode === "draw_room", !hasBuildingSelected && mode !== "draw_room")}
            onClick={() => {
              if (hasBuildingSelected) changeMode("draw_room");
              else alert("Select a building first to draw a room.");
            }}
            title={!hasBuildingSelected ? "Select a building first" : ""}
          >
            Draw Room
          </button>
          <button className={btnClass(mode === "add_node")} onClick={() => changeMode("add_node")}>
            Add Node
          </button>
          <button className={btnClass(mode === "connect_nodes")} onClick={() => changeMode("connect_nodes")}>
            Connect Nodes
          </button>
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Layers</h3>
        <div className="flex flex-col gap-2">
          {(Object.keys(layersVisible) as Array<keyof typeof layersVisible>).map((layer) => (
            <label key={layer} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={layersVisible[layer]}
                onChange={() => toggleLayer(layer)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="capitalize">{layer}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500 space-y-2">
        <p><strong>Tips:</strong></p>
        <ul className="list-disc pl-4 space-y-1">
          <li>Double-click to finish drawing a building or room polygon.</li>
          <li>For paths, click first node then second node.</li>
          <li>Drag nodes or shapes in Select mode to move them.</li>
        </ul>
      </div>
    </div>
  );
};
