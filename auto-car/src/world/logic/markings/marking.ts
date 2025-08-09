import { Point } from "../primitives/point";
import { Segment } from "../primitives/segment";
import type { Polygon } from "../primitives/polygon";
import { Envelope } from "../primitives/envelope";
import { angle, translate } from "../math/utils";

export interface MarkingInfo {
  center: { x: number; y: number };
  directionVector: { x: number; y: number };
  width: number;
  height: number;
  type: string;
}

export class Marking {
  center: Point;
  directionVector: Point;
  width: number;
  height: number;
  support: Segment;
  poly: Polygon;
  type: string;

  constructor(
    center: Point,
    directionVector: Point,
    width: number,
    height: number
  ) {
    this.center = center;
    this.directionVector = directionVector;
    this.width = width;
    this.height = height;

    this.support = new Segment(
      translate(center, angle(directionVector), height / 2),
      translate(center, angle(directionVector), -height / 2)
    );

    this.poly = new Envelope(this.support, width, 0).poly;
    this.type = "marking";
  }

  draw(ctx: CanvasRenderingContext2D): void {
    this.poly.draw(ctx);
  }
}
