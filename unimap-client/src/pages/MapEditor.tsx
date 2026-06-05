import React, { useState } from "react";
import { useMapEditor } from "../hooks/useMapEditor";
import { Toolbar } from "../components/MapEditor/Toolbar";
import { Canvas } from "../components/MapEditor/Canvas";
import { PropertiesPanel } from "../components/MapEditor/PropertiesPanel";
import { createMap } from "../components/MapEditor/api";

export const MapEditor: React.FC = () => {
  const editor = useMapEditor();
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setErrorMsg("");
      setSuccessMsg("");

      const payload = editor.getExportData();
      await createMap(payload);

      setSuccessMsg("Map successfully created!");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message || "An error occurred while saving.");
      } else {
        setErrorMsg("An error occurred while saving.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex w-screen h-screen overflow-hidden text-gray-900 bg-white font-sans">
      <Toolbar
        mode={editor.mode}
        changeMode={editor.changeMode}
        drawTarget={editor.drawTarget}
        setDrawTarget={editor.setDrawTarget}
        currentFloor={editor.currentFloor}
        floorUp={editor.floorUp}
        floorDown={editor.floorDown}
        setCurrentFloor={editor.setCurrentFloor}
        layersVisible={editor.layersVisible}
        toggleLayer={editor.toggleLayer}
      />
      <div className="flex-1 relative border-r border-gray-200">
        <Canvas
          buildings={editor.buildings}
          nodes={editor.nodes}
          paths={editor.paths}
          mode={editor.mode}
          currentFloor={editor.currentFloor}
          selection={editor.selection}
          layersVisible={editor.layersVisible}
          activePolygon={editor.activePolygon}
          rectStart={editor.rectStart}
          rectEnd={editor.rectEnd}
          circleCenter={editor.circleCenter}
          circleEdge={editor.circleEdge}
          pathStart={editor.pathStart}
          handleCanvasClick={editor.handleCanvasClick}
          handleCanvasDoubleClick={editor.handleCanvasDoubleClick}
          handleNodeClick={editor.handleNodeClick}
          handleRoomClick={editor.handleRoomClick}
          handleItemClick={editor.handleItemClick}
          handleRectMouseDown={editor.handleRectMouseDown}
          handleRectMouseMove={editor.handleRectMouseMove}
          handleRectMouseUp={editor.handleRectMouseUp}
          handleCircleMouseDown={editor.handleCircleMouseDown}
          handleCircleMouseMove={editor.handleCircleMouseMove}
          handleCircleMouseUp={editor.handleCircleMouseUp}
          startDragNode={editor.startDragNode}
          onDragNode={editor.onDragNode}
          stopDragNode={editor.stopDragNode}
          startDragShape={editor.startDragShape}
          onDragShape={editor.onDragShape}
          stopDragShape={editor.stopDragShape}
        />
        {errorMsg && (
          <div className="absolute top-4 right-4 bg-red-100 text-red-800 px-4 py-2 rounded shadow-md text-sm">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="absolute top-4 right-4 bg-green-100 text-green-800 px-4 py-2 rounded shadow-md text-sm">
            {successMsg}
          </div>
        )}
      </div>
      <PropertiesPanel
        mapInfo={editor.mapInfo}
        setMapInfo={editor.setMapInfo}
        selection={editor.selection}
        buildings={editor.buildings}
        nodes={editor.nodes}
        paths={editor.paths}
        updateBuilding={editor.updateBuilding}
        updateRoom={editor.updateRoom}
        updateNode={editor.updateNode}
        findRoomParent={editor.findRoomParent}
        deleteSelection={editor.deleteSelection}
        onSave={handleSave}
        isSaving={isSaving}
        getExportData={editor.getExportData}
      />
    </div>
  );
};

export default MapEditor;
