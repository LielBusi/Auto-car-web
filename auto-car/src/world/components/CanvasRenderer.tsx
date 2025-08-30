import React, { useEffect, useRef } from "react";
import LZString from "lz-string";

import { World } from "../logic/world";
import { Graph } from "../logic/math/graph";
import { Viewport } from "../logic/viewport";

import { GraphEditor } from "../logic/editors/graphEditor";
import { StopEditor } from "../logic/editors/stopEditor";
import { CrossingEditor } from "../logic/editors/crossingEditor";
import { StartEditor } from "../logic/editors/startEditor";
import { ParkingEditor } from "../logic/editors/parkingEditor";
import { LightEditor } from "../logic/editors/lightEditor";
import { TargetEditor } from "../logic/editors/targetEditor";
import { YieldEditor } from "../logic/editors/yieldEditor";

import { scale } from "../logic/math/utils";

import styles from "./WorldEditor.module.css";
import type { MarkingEditor } from "../logic/editors/markingEditor";

interface CanvasRendererProps {
  worldRef: React.MutableRefObject<World | null>;
  graphRef: React.MutableRefObject<Graph | null>;
  viewportRef: React.MutableRefObject<Viewport | null>;
  toolsRef: React.MutableRefObject<Record<
    string,
    { button: HTMLButtonElement; editor: any }
  > | null>;
  toolbarButtonsRef: React.MutableRefObject<
    Record<string, HTMLButtonElement | null>
  >;
}

export const CanvasRenderer: React.FC<CanvasRendererProps> = ({
  worldRef,
  graphRef,
  viewportRef,
  toolsRef,
  toolbarButtonsRef,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const oldGraphHashRef = useRef<string>("");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = 600;
    canvas.height = 600;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // load world from localStorage
    const compressedData = localStorage.getItem("world");
    const worldString = compressedData
      ? LZString.decompressFromUTF16(compressedData)
      : null;
    const worldInfo = worldString ? JSON.parse(worldString) : null;
    const world = worldInfo ? World.load(worldInfo) : new World(new Graph());
    worldRef.current = world;
    graphRef.current = world.graph;

    const viewport = new Viewport(canvas, world.zoom, world.offset);
    viewportRef.current = viewport;

    // When toolbar buttons are registered, create editors and toolsRef
    const requiredIds = [
      "graph",
      "stop",
      "crossing",
      "start",
      "parking",
      "light",
      "target",
      "yield",
    ];
    let created = false;

    const tryCreateTools = () => {
      if (created) return;
      const b = toolbarButtonsRef.current;
      if (!b) return;
      for (const id of requiredIds) {
        if (!b[id]) return; // still waiting for registration
      }

      // create editors using same patterns as original
      toolsRef.current = {
        graph: {
          button: b.graph!,
          editor: new GraphEditor(viewport, graphRef.current!),
        },
        stop: {
          button: b.stop!,
          editor: new StopEditor(viewport, worldRef.current!),
        },
        crossing: {
          button: b.crossing!,
          editor: new CrossingEditor(viewport, worldRef.current!),
        },
        start: {
          button: b.start!,
          editor: new StartEditor(viewport, worldRef.current!),
        },
        parking: {
          button: b.parking!,
          editor: new ParkingEditor(viewport, worldRef.current!),
        },
        light: {
          button: b.light!,
          editor: new LightEditor(viewport, worldRef.current!),
        },
        target: {
          button: b.target!,
          editor: new TargetEditor(viewport, worldRef.current!),
        },
        yield: {
          button: b.yield!,
          editor: new YieldEditor(viewport, worldRef.current!),
        },
      };

      // set initial states (mirror old behaviour)
      for (const tool of Object.values(toolsRef.current)) {
        tool.button.style.backgroundColor = "gray";
        tool.button.style.filter = "grayscale(100%)";
        tool.editor.disable?.();
      }

      // enable graph editor by default
      toolsRef.current.graph.button.style.backgroundColor = "white";
      toolsRef.current.graph.button.style.filter = "";
      toolsRef.current.graph.editor.enable?.();

      oldGraphHashRef.current = graphRef.current!.hash();

      created = true;
    };

    // poll for button registration (fast interval)
    const interval = window.setInterval(tryCreateTools, 40);
    tryCreateTools();

    let animationFrameId = 0;

    const animate = () => {
      if (!viewportRef.current || !graphRef.current || !worldRef.current) {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }

      viewportRef.current.reset();

      // regenerate world when graph changed
      if (graphRef.current.hash() !== oldGraphHashRef.current) {
        worldRef.current.generate();
        oldGraphHashRef.current = graphRef.current.hash();
      }

      const viewPoint = scale(viewportRef.current.getOffset(), -1);
      worldRef.current.draw(ctx, viewPoint);

      ctx.globalAlpha = 0.3;
      if (toolsRef.current) {
        for (const tool of Object.values(toolsRef.current)) {
          tool.editor.display?.();
        }
      }
      ctx.globalAlpha = 1;

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      clearInterval(interval);
      cancelAnimationFrame(animationFrameId);
      // leave editors disposal to parent's dispose() to match original lifecycle
    };
  }, [toolbarButtonsRef, worldRef, graphRef, viewportRef, toolsRef]);

  return <canvas ref={canvasRef} className={styles.canvas} />;
};
