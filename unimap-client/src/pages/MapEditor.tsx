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
        layersVisible={editor.layersVisible}
        toggleLayer={editor.toggleLayer}
        hasBuildingSelected={editor.selection.type === "building" && !!editor.selection.id}
      />
      <div className="flex-1 relative border-r border-gray-200">
        <Canvas {...editor} />
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
        rooms={editor.rooms}
        nodes={editor.nodes}
        paths={editor.paths}
        updateBuilding={editor.updateBuilding}
        updateRoom={editor.updateRoom}
        deleteSelection={editor.deleteSelection}
        onSave={handleSave}
        isSaving={isSaving}
      />
    </div>
  );
};

export default MapEditor;
