import React, { useEffect, useRef, useState } from "react";

import { World } from "./logic/world";
import { Graph } from "./logic/math/graph";
import { Viewport } from "./logic/viewport";
import { Osm } from "./logic/math/osm";

import { GraphEditor } from "./logic/editors/graphEditor";
import { StopEditor } from "./logic/editors/stopEditor";
import { CrossingEditor } from "./logic/editors/crossingEditor";
import { StartEditor } from "./logic/editors/startEditor";
import { ParkingEditor } from "./logic/editors/parkingEditor";
import { LightEditor } from "./logic/editors/lightEditor";
import { TargetEditor } from "./logic/editors/targetEditor";
import { YieldEditor } from "./logic/editors/yieldEditor";

import { scale } from "./logic/math/utils";

import "./styles.css";

export const WorldEditor: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [osmPanelVisible, setOsmPanelVisible] = useState(false);
  const [osmDataValue, setOsmDataValue] = useState("");

  const worldRef = useRef<World | null>(null);
  const graphRef = useRef<Graph | null>(null);
  const viewportRef = useRef<Viewport | null>(null);
  const toolsRef = useRef<Record<
    string,
    { button: HTMLButtonElement; editor: any }
  > | null>(null);
  const oldGraphHashRef = useRef<string>("");

  const [mode, setMode] = useState<string>("graph");

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = 600;
    canvas.height = 600;

    const ctx = canvas.getContext("2d")!;

    const worldString = localStorage.getItem("world");
    const worldInfo = worldString ? JSON.parse(worldString) : null;
    const world = worldInfo ? World.load(worldInfo) : new World(new Graph());
    worldRef.current = world;
    graphRef.current = world.graph;

    const viewport = new Viewport(canvas, world.zoom, world.offset);
    viewportRef.current = viewport;

    const buttons = {
      graphBtn: document.getElementById("graphBtn") as HTMLButtonElement,
      stopBtn: document.getElementById("stopBtn") as HTMLButtonElement,
      crossingBtn: document.getElementById("crossingBtn") as HTMLButtonElement,
      startBtn: document.getElementById("startBtn") as HTMLButtonElement,
      parkingBtn: document.getElementById("parkingBtn") as HTMLButtonElement,
      lightBtn: document.getElementById("lightBtn") as HTMLButtonElement,
      targetBtn: document.getElementById("targetBtn") as HTMLButtonElement,
      yieldBtn: document.getElementById("yieldBtn") as HTMLButtonElement,
    };

    toolsRef.current = {
      graph: {
        button: buttons.graphBtn,
        editor: new GraphEditor(viewport, graphRef.current),
      },
      stop: {
        button: buttons.stopBtn,
        editor: new StopEditor(viewport, world),
      },
      crossing: {
        button: buttons.crossingBtn,
        editor: new CrossingEditor(viewport, world),
      },
      start: {
        button: buttons.startBtn,
        editor: new StartEditor(viewport, world),
      },
      parking: {
        button: buttons.parkingBtn,
        editor: new ParkingEditor(viewport, world),
      },
      light: {
        button: buttons.lightBtn,
        editor: new LightEditor(viewport, world),
      },
      target: {
        button: buttons.targetBtn,
        editor: new TargetEditor(viewport, world),
      },
      yield: {
        button: buttons.yieldBtn,
        editor: new YieldEditor(viewport, world),
      },
    };

    oldGraphHashRef.current = graphRef.current.hash();

    enableEditor("graph");
    setMode("graph");

    let animationFrameId: number;

    function animate() {
      if (!viewportRef.current || !graphRef.current || !worldRef.current)
        return;
      viewportRef.current.reset();

      if (graphRef.current.hash() !== oldGraphHashRef.current) {
        worldRef.current.generate();
        oldGraphHashRef.current = graphRef.current.hash();
      }
      const viewPoint = scale(viewportRef.current.getOffset(), -1);
      worldRef.current.draw(ctx, viewPoint);

      ctx.globalAlpha = 0.3;
      if (toolsRef.current) {
        for (const tool of Object.values(toolsRef.current)) {
          tool.editor.display();
        }
      }
      ctx.globalAlpha = 1;

      animationFrameId = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      dispose();
    };
  }, []);

  // פונקציות מניפולציה

  function enableEditor(newMode: string) {
    if (!toolsRef.current) return;
    disableEditors();

    const tool = toolsRef.current[newMode];
    if (!tool) return;

    tool.button.style.backgroundColor = "white";
    tool.button.style.filter = "";
    tool.editor.enable();
    setMode(newMode);
  }

  function disableEditors() {
    if (!toolsRef.current) return;
    for (const tool of Object.values(toolsRef.current)) {
      tool.button.style.backgroundColor = "gray";
      tool.button.style.filter = "grayscale(100%)";
      tool.editor.disable();
    }
  }

  function dispose() {
    if (!toolsRef.current || !worldRef.current) return;
    toolsRef.current.graph.editor.dispose();
    worldRef.current.markings.length = 0;
  }

  function save() {
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
    localStorage.setItem("world", dataStr);
  }

  function load(event: React.ChangeEvent<HTMLInputElement>) {
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
      localStorage.setItem("world", JSON.stringify(worldRef.current));
      window.location.reload();
    };
  }

  function openOsmPanel() {
    setOsmPanelVisible(true);
  }

  function closeOsmPanel() {
    setOsmPanelVisible(false);
  }

  function parseOsmData() {
    if (!osmDataValue.trim()) {
      alert("Paste data first");
      return;
    }
    if (!graphRef.current) return;

    const res = Osm.parseRoads(JSON.parse(osmDataValue));
    graphRef.current.points = res.points;
    graphRef.current.segments = res.segments;
    closeOsmPanel();
  }

  // JSX: הצגת כל האלמנטים בפנים קומפוננטה אחת

  return (
    <div>
      <h1>World Editor</h1>
      <canvas
        ref={canvasRef}
        id="myCanvas"
        width={600}
        height={600}
        style={{ border: "1px solid black", display: "block", marginBottom: 8 }}
      />
      <div id="controls" style={{ marginBottom: 20 }}>
        <button onClick={dispose}>🗑️</button>
        <button onClick={save}>💾</button>
        <label
          htmlFor="fileInput"
          className="file-input-label"
          style={{ cursor: "pointer" }}
        >
          📁
          <input
            type="file"
            id="fileInput"
            accept=".world"
            onChange={load}
            style={{ display: "none" }}
          />
        </label>
        <button onClick={openOsmPanel}>🗺️</button>
        &nbsp;
        <button id="graphBtn" onClick={() => enableEditor("graph")}>
          🌐
        </button>
        <button id="stopBtn" onClick={() => enableEditor("stop")}>
          🛑
        </button>
        <button id="yieldBtn" onClick={() => enableEditor("yield")}>
          ⚠️
        </button>
        <button id="crossingBtn" onClick={() => enableEditor("crossing")}>
          🚶
        </button>
        <button id="parkingBtn" onClick={() => enableEditor("parking")}>
          🅿️
        </button>
        <button id="lightBtn" onClick={() => enableEditor("light")}>
          🚦
        </button>
        <button id="startBtn" onClick={() => enableEditor("start")}>
          🚙
        </button>
        <button id="targetBtn" onClick={() => enableEditor("target")}>
          🎯
        </button>
      </div>
      {osmPanelVisible && (
        <div
          id="osmPanel"
          style={{
            border: "1px solid gray",
            padding: 10,
            maxWidth: 600,
            backgroundColor: "#fafafa",
          }}
        >
          <textarea
            id="osmDataContainer"
            rows={10}
            cols={50}
            placeholder="Paste OSM data here"
            value={osmDataValue}
            onChange={(e) => setOsmDataValue(e.target.value)}
            style={{ width: "100%" }}
          />
          <div style={{ marginTop: 8 }}>
            <button onClick={parseOsmData}>✔️</button>
            <button onClick={closeOsmPanel}>❌</button>
          </div>
        </div>
      )}
    </div>
  );
};
