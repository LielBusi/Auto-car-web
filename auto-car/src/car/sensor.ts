import { lerp, getIntersection } from "../world/logic/math/utils";
import { Point } from "../world/logic/primitives/point";
import type { Polygon } from "../world/logic/primitives/polygon";
import Car from "./car";

export type Intersection = {
  x: number;
  y: number;
  offset: number;
};

export class Sensor {
  private car: Car;
  public rayCount = 5;
  public rayLength = 150;
  public raySpread = Math.PI / 2;

  private rays: [Point, Point][] = [];
  public readings: (Intersection | null)[] = [];

  constructor(car: Car) {
    this.car = car;
  }

  public update(roadBorders: [Point, Point][], traffic: Polygon[]): void {
    this.castRays();
    this.readings = this.rays.map((ray) =>
      this.getReading(ray, roadBorders, traffic)
    );
  }

  private getReading(
    ray: [Point, Point],
    roadBorders: [Point, Point][],
    traffic: Polygon[]
  ): Intersection | null {
    const touches: Intersection[] = [];

    for (const border of roadBorders) {
      const touch = getIntersection(ray[0], ray[1], border[0], border[1]);
      if (touch) touches.push(touch);
    }

    for (const car of traffic) {
      const poly = car.points;
      for (let i = 0; i < poly.length; i++) {
        const nextIndex = (i + 1) % poly.length;
        const touch = getIntersection(ray[0], ray[1], poly[i], poly[nextIndex]);
        if (touch) touches.push(touch);
      }
    }

    if (touches.length === 0) return null;

    const minOffset = Math.min(...touches.map((t) => t.offset));
    return touches.find((t) => t.offset === minOffset) ?? null;
  }

  private castRays(): void {
    this.rays = [];

    for (let i = 0; i < this.rayCount; i++) {
      const t = this.rayCount === 1 ? 0.5 : i / (this.rayCount - 1);
      const rayAngle =
        lerp(this.raySpread / 2, -this.raySpread / 2, t) + this.car.angle;

      const start = new Point(this.car.x, this.car.y);
      const end = new Point(
        this.car.x - Math.sin(rayAngle) * this.rayLength,
        this.car.y - Math.cos(rayAngle) * this.rayLength
      );

      this.rays.push([start, end]);
    }
  }

  public draw(ctx: CanvasRenderingContext2D): void {
    for (let i = 0; i < this.rayCount; i++) {
      const start = this.rays[i][0];
      const originalEnd = this.rays[i][1];
      const end = this.readings[i] ?? originalEnd;

      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "yellow";
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();

      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "black";
      ctx.moveTo(originalEnd.x, originalEnd.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
    }
  }
}
