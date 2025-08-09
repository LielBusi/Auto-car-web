import { Point } from "../primitives/point";
import { Segment } from "../primitives/segment";
import type { Polygon } from "../primitives/polygon";
import { Envelope } from "../primitives/envelope";
import { angle, translate } from "../math/utils";
import { Crossing } from "./crossing";
import { Light } from "./light";
import { Parking } from "./parking";
import { Start } from "./start";
import { Stop } from "./stop";
import { Target } from "./target";
import { Yield } from "./yield";

interface MarkingInfo {
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

  static load(info: MarkingInfo): Marking | undefined {
    const point = new Point(info.center.x, info.center.y);
    const dir = new Point(info.directionVector.x, info.directionVector.y);

    switch (info.type) {
      case "crossing":
        return new Crossing(point, dir, info.width, info.height);
      case "light":
        return new Light(point, dir, info.width, info.height);
      case "marking":
        return new Marking(point, dir, info.width, info.height);
      case "parking":
        return new Parking(point, dir, info.width, info.height);
      case "start":
        return new Start(point, dir, info.width, info.height);
      case "stop":
        return new Stop(point, dir, info.width, info.height);
      case "target":
        return new Target(point, dir, info.width, info.height);
      case "yield":
        return new Yield(point, dir, info.width, info.height);
      default:
        return undefined;
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    this.poly.draw(ctx);
  }
}
