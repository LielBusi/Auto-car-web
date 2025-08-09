import { Viewport } from "../viewport";
import { World } from "../world";
import { Point } from "../primitives/point";
import { MarkingEditor } from "./markingEditor";
import { Yield } from "../markings/yield";

export class YieldEditor extends MarkingEditor {
  constructor(viewport: Viewport, world: World) {
    super(viewport, world, world.laneGuides);
  }

  createMarking(center: Point, directionVector: Point): Yield {
    return new Yield(
      center,
      directionVector,
      this.world.roadWidth / 2,
      this.world.roadWidth / 2
    );
  }
}
