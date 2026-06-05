import React from "react";
import type { EditorMode, DrawTarget } from "./types";
import { Link } from "react-router-dom";

interface ToolbarProps {
  mode: EditorMode;
  changeMode: (mode: EditorMode) => void;
  drawTarget: DrawTarget;
  setDrawTarget: (t: DrawTarget) => void;
  currentFloor: number;
  floorUp: () => void;
  floorDown: () => void;
  setCurrentFloor: (f: number) => void;
  layersVisible: { buildings: boolean; rooms: boolean; nodes: boolean; paths: boolean };
  toggleLayer: (layer: "buildings" | "rooms" | "nodes" | "paths") => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  mode,
  changeMode,
  drawTarget,
  setDrawTarget,
  currentFloor,
  floorUp,
  floorDown,
  layersVisible,
  toggleLayer,
}) => {
  const btnClass = (active: boolean) =>
    `px-4 py-2 text-sm font-medium rounded-md transition-colors ${active
      ? "bg-blue-600 text-white"
      : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
    }`;

  const toggleBtnClass = (active: boolean) =>
    `flex-1 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${active
      ? "bg-indigo-600 text-white"
      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
    }`;

  const isDrawMode = mode === "draw_polygon" || mode === "draw_rectangle" || mode === "draw_circle";

  return (
    <div className="flex flex-col gap-4 p-4 bg-gray-50 border-r border-gray-200 w-64 h-full overflow-y-auto">
      <div className="mb-2">
        <Link to="/" className="text-blue-600 hover:underline text-sm font-medium flex items-center gap-1">
          &larr; Back to Map Viewer
        </Link>
      </div>

      {/* Drawing tools */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Tools</h3>
        <div className="flex flex-col gap-2">
          <button className={btnClass(mode === "select")} onClick={() => changeMode("select")}>
            ↖ Select / Move
          </button>
          <button className={btnClass(mode === "draw_polygon")} onClick={() => changeMode("draw_polygon")}>
            ⬠ Polygon
          </button>
          <button className={btnClass(mode === "draw_rectangle")} onClick={() => changeMode("draw_rectangle")}>
            ▭ Rectangle
          </button>
          <button className={btnClass(mode === "draw_circle")} onClick={() => changeMode("draw_circle")}>
            ◯ Circle
          </button>
          <button className={btnClass(mode === "add_node")} onClick={() => changeMode("add_node")}>
            ● Add Node
          </button>
          <button className={btnClass(mode === "draw_path")} onClick={() => changeMode("draw_path")}>
            ╱ Draw Path
          </button>
        </div>
      </div>

      {/* Draw target toggle */}
      {isDrawMode && (
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Drawing As</h3>
          <div className="flex gap-1">
            <button
              className={toggleBtnClass(drawTarget === "building")}
              onClick={() => setDrawTarget("building")}
            >
              Building
            </button>
            <button
              className={toggleBtnClass(drawTarget === "room")}
              onClick={() => setDrawTarget("room")}
            >
              Room
            </button>
          </div>
        </div>
      )}

      {/* Floor controls */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Floor</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={floorDown}
            className="w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-bold"
          >
            −
          </button>
          <span className="flex-1 text-center text-sm font-semibold text-gray-800 bg-white border border-gray-200 rounded-md py-1">
            {currentFloor}
          </span>
          <button
            onClick={floorUp}
            className="w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-bold"
          >
            +
          </button>
        </div>
      </div>

      {/* Layers */}
      <div>
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

      {/* Tips */}
      <div className="mt-auto text-xs text-gray-500 space-y-2">
        <p><strong>Tips:</strong></p>
        <ul className="list-disc pl-4 space-y-1">
          <li><b>Polygon:</b> Click to place vertices, double-click to finish.</li>
          <li><b>Rectangle:</b> Click and drag to define the box.</li>
          <li><b>Circle:</b> Click and drag from the center outward.</li>
          <li><b>Path:</b> Click a node or room, then click another.</li>
          <li><b>Pan:</b> Middle-click or Alt+click and drag.</li>
          <li><b>Zoom:</b> Scroll wheel.</li>
          <li>Toggle <b>Building / Room</b> to set what your shape becomes.</li>
        </ul>
      </div>
    </div>
  );
};
