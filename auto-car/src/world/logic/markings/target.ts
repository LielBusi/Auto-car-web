import { Marking } from "./marking";
import { Point } from "../primitives/point";

export class Target extends Marking {
  constructor(
    center: Point,
    directionVector: Point,
    width: number,
    height: number
  ) {
    super(center, directionVector, width, height);
    this.type = "target";
  }

  draw(ctx: CanvasRenderingContext2D): void {
    this.center.draw(ctx, { color: "red", size: 30 });
    this.center.draw(ctx, { color: "white", size: 20 });
    this.center.draw(ctx, { color: "red", size: 10 });
  }
}
