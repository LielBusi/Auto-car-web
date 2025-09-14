import React, { useEffect, useRef } from "react";
import { World } from "../world/logic/world";
import { Graph } from "../world/logic/math/graph";
import { Viewport } from "../world/logic/viewport";
import Car from "../car/car";
import NeuralNetwork from "../geneticAlgorithm/network";
import { Visualizer } from "../geneticAlgorithm/visualizer";
import { Start } from "../world/logic/markings/start";
import { Point } from "../world/logic/primitives/point";
import { angle, scale } from "../world/logic/math/utils";
import { FaSave, FaTrash } from "react-icons/fa";

import LZString from "lz-string";

const N_CARS = 250;

const GeneticLearning: React.FC = () => {
  const carCanvasRef = useRef<HTMLCanvasElement>(null);
  const networkCanvasRef = useRef<HTMLCanvasElement>(null);
  const miniMapCanvasRef = useRef<HTMLCanvasElement>(null);

  const worldRef = useRef<World | null>(null);
  const viewportRef = useRef<Viewport | null>(null);
  const carsRef = useRef<Car[]>([]);
  const trafficRef = useRef<Car[]>([]);
  const bestCarRef = useRef<Car | null>(null);

  useEffect(() => {
    const carCanvas = carCanvasRef.current;
    const networkCanvas = networkCanvasRef.current;
    const miniMapCanvas = miniMapCanvasRef.current;
    if (!carCanvas || !networkCanvas || !miniMapCanvas) return;

    carCanvas.width = window.innerWidth - 330;
    carCanvas.height = window.innerHeight;

    networkCanvas.width = 300;
    networkCanvas.height = window.innerHeight - 300;

    miniMapCanvas.width = 300;
    miniMapCanvas.height = 300;

    const carCtx = carCanvas.getContext("2d")!;
    const networkCtx = networkCanvas.getContext("2d")!;

    const compressedData = localStorage.getItem("world");
    const worldString = compressedData
      ? LZString.decompressFromUTF16(compressedData)
      : null;
    const worldInfo = worldString ? JSON.parse(worldString) : null;
    const world = worldInfo ? World.load(worldInfo) : new World(new Graph());
    worldRef.current = world;

    const viewport = new Viewport(carCanvas, world.zoom, world.offset);
    viewportRef.current = viewport;

    const cars = generateCars(N_CARS, world);
    carsRef.current = cars;
    let bestCar = cars[0];
    bestCarRef.current = bestCar;

    if (localStorage.getItem("bestBrain")) {
      for (let i = 0; i < cars.length; i++) {
        cars[i].brain = JSON.parse(localStorage.getItem("bestBrain")!);
        if (i !== 0) NeuralNetwork.mutate(cars[i].brain, 0.1);
      }
    }

    const traffic: Car[] = [];
    trafficRef.current = traffic;

    const roadBorders = world.roadBorders.map((s) => [s.p1, s.p2]);

    function animate(time: number) {
      for (const t of traffic) t.update(roadBorders, []);
      for (const c of cars) c.update(roadBorders, traffic);

      bestCar = cars.reduce((a, b) => (a.fitness > b.fitness ? a : b), cars[0]);
      bestCarRef.current = bestCar;

      world.cars = cars;
      world.bestCar = bestCar;

      viewport.offset.x = -bestCar.x;
      viewport.offset.y = -bestCar.y;

      viewport.reset();
      const viewPoint = scale(viewport.getOffset(), -1);

      carCtx.clearRect(0, 0, carCanvas.width, carCanvas.height);
      world.draw(carCtx, viewPoint, false);

      for (const t of traffic) t.draw(carCtx);

      networkCtx.lineDashOffset = -time / 50;
      networkCtx.clearRect(0, 0, networkCanvas.width, networkCanvas.height);
      Visualizer.drawNetwork(networkCtx, bestCar.brain);

      requestAnimationFrame(animate);
    }

    animate(0);
  }, []);

  function generateCars(N: number, world: World) {
    const startPoints = world.markings.filter((m) => m instanceof Start);
    const startPoint =
      startPoints.length > 0 ? startPoints[0].center : new Point(100, 100);
    const dir =
      startPoints.length > 0
        ? startPoints[0].directionVector
        : new Point(0, -1);
    const startAngle = -angle(dir) + Math.PI / 2;

    const cars: Car[] = [];
    for (let i = 0; i < N; i++) {
      cars.push(new Car(startPoint.x, startPoint.y, 30, 50, "AI", startAngle));
    }
    return cars;
  }

  function saveBrain() {
    if (bestCarRef.current) {
      localStorage.setItem(
        "bestBrain",
        JSON.stringify(bestCarRef.current.brain)
      );
    }
  }

  function discardBrain() {
    localStorage.removeItem("bestBrain");
  }

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ position: "relative", flex: 1 }}>
        <canvas ref={carCanvasRef} id="carCanvas" style={{ zIndex: 1 }} />
        <canvas
          ref={miniMapCanvasRef}
          id="miniMapCanvas"
          style={{ position: "absolute", bottom: 0, right: 0, zIndex: 2 }}
        />
        <div
          id="verticalButtons"
          style={{
            position: "fixed",
            top: 20,
            left: 20,
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <button
            onClick={saveBrain}
            title="Save Brain"
            style={{ fontSize: "20px" }}
          >
            <FaSave />
          </button>
          <button
            onClick={discardBrain}
            title="Discard Brain"
            style={{ fontSize: "20px" }}
          >
            <FaTrash />
          </button>
        </div>
      </div>
      <canvas ref={networkCanvasRef} id="networkCanvas" />
    </div>
  );
};

export default GeneticLearning;
