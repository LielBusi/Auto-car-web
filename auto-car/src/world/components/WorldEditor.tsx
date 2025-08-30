import React, { useCallback, useRef, useState } from "react";
import { CanvasRenderer } from "./CanvasRenderer";
import { Toolbar } from "./Toolbar";
import type { RegisterToolFn } from "./Toolbar";
import { OsmPanel } from "./OsmPanel";

import { World } from "../logic/world";
import { Graph } from "../logic/math/graph";
import { Viewport } from "../logic/viewport";
import { Osm } from "../logic/math/osm";

import LZString from "lz-string";
import styles from "./WorldEditor.module.css";

export const WorldEditor: React.FC = () => {
  const [mode, setMode] = useState<string>("graph");
  const [osmPanelVisible, setOsmPanelVisible] = useState(false);
  const [osmDataValue, setOsmDataValue] = useState("");

  // shared refs the renderer and toolbar use
  const worldRef = useRef<World | null>(null);
  const graphRef = useRef<Graph | null>(null);
  const viewportRef = useRef<Viewport | null>(null);

  // toolbar buttons are registered by Toolbar via registerTool
  const toolbarButtonsRef = useRef<Record<string, HTMLButtonElement | null>>(
    {}
  );

  // toolsRef will be filled by CanvasRenderer when editors are created
  const toolsRef = useRef<Record<
    string,
    { button: HTMLButtonElement; editor: any }
  > | null>(null);

  // registerTool is passed to Toolbar which will call it with (id, el)
  const registerTool: RegisterToolFn = useCallback((id, el) => {
    toolbarButtonsRef.current[id] = el;
  }, []);

  // enable / disable functions (mirror your original logic)
  const disableEditors = useCallback(() => {
    if (!toolsRef.current) return;
    for (const tool of Object.values(toolsRef.current)) {
      tool.button.style.backgroundColor = "gray";
      tool.button.style.filter = "grayscale(100%)";
      tool.editor?.disable?.();
    }
  }, []);

  const enableEditor = useCallback(
    (newMode: string) => {
      if (!toolsRef.current) return;
      disableEditors();

      const tool = toolsRef.current[newMode];
      if (!tool) return;

      tool.button.style.backgroundColor = "white";
      tool.button.style.filter = "";
      tool.editor?.enable?.();
      setMode(newMode);
    },
    [disableEditors]
  );

  const dispose = useCallback(() => {
    if (!toolsRef.current || !worldRef.current) return;
    toolsRef.current.graph.editor.dispose?.();
    worldRef.current.markings.length = 0;
  }, []);

  const save = useCallback(() => {
    if (!viewportRef.current || !worldRef.current) return;

    worldRef.current.zoom = viewportRef.current.zoom;
    worldRef.current.offset = viewportRef.current.offset;

    const dataStr = JSON.stringify(worldRef.current);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const element = document.createElement("a");
    element.href = url;
    element.download = "name.world";
    element.click();

    URL.revokeObjectURL(url);
    localStorage.setItem("world", LZString.compressToUTF16(dataStr));
  }, []);

  const load = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      alert("No file selected.");
      return;
    }
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = (evt) => {
      if (!evt.target) return;
      const fileContent = evt.target.result as string;
      const jsonData = JSON.parse(fileContent);
      worldRef.current = World.load(jsonData);
      // keep compressed in localStorage to preserve across reloads
      localStorage.setItem(
        "world",
        LZString.compressToUTF16(JSON.stringify(worldRef.current))
      );
      window.location.reload();
    };
  }, []);

  const openOsmPanel = useCallback(() => setOsmPanelVisible(true), []);
  const closeOsmPanel = useCallback(() => setOsmPanelVisible(false), []);

  const parseOsmData = useCallback(() => {
    if (!osmDataValue.trim()) {
      alert("Paste data first");
      return;
    }
    if (!graphRef.current) return;

    const res = Osm.parseRoads(JSON.parse(osmDataValue));
    graphRef.current.points = res.points;
    graphRef.current.segments = res.segments;
    setOsmDataValue("");
    closeOsmPanel();
  }, [osmDataValue, closeOsmPanel]);

  return (
    <div className={styles.editorContainer}>
      <h1 className={styles.title}>World Editor</h1>

      <CanvasRenderer
        worldRef={worldRef}
        graphRef={graphRef}
        viewportRef={viewportRef}
        toolsRef={toolsRef}
        toolbarButtonsRef={toolbarButtonsRef}
      />

      <div className={styles.toolbarWrapper}>
        <Toolbar
          mode={mode}
          enableEditor={enableEditor}
          setOsmPanelVisible={openOsmPanel}
          onSave={save}
          onDispose={dispose}
          onFileLoad={load}
          registerTool={registerTool}
        />
      </div>

      {osmPanelVisible && (
        <div className={styles.osmPanelWrapper}>
          <OsmPanel
            osmDataValue={osmDataValue}
            setOsmDataValue={setOsmDataValue}
            onConfirm={parseOsmData}
            onClose={closeOsmPanel}
          />
        </div>
      )}
    </div>
  );
};
