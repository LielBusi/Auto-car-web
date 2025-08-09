import { Marking } from "./marking";
import { Point } from "../primitives/point";
import { Segment } from "../primitives/segment";
import { add, scale, perpendicular } from "../math/utils";

export class Crossing extends Marking {
  borders: Segment[];

  constructor(
    center: Point,
    directionVector: Point,
    width: number,
    height: number
  ) {
    super(center, directionVector, width, height);

    // Using segments at index 0 and 2 from poly's segments as borders
    this.borders = [this.poly.segments[0], this.poly.segments[2]];
    this.type = "crossing";
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const perp = perpendicular(this.directionVector);
    const line = new Segment(
      add(this.center, scale(perp, this.width / 2)),
      add(this.center, scale(perp, -this.width / 2))
    );
    line.draw(ctx, {
      width: this.height,
      color: "white",
      dash: [11, 11],
    });
  }
}
