import { Viewport } from "../viewport";
import { World } from "../world";
import { Point } from "../primitives/point";
import { MarkingEditor } from "./markingEditor";
import { Target } from "../markings/target";

export class TargetEditor extends MarkingEditor {
  constructor(viewport: Viewport, world: World) {
    super(viewport, world, world.laneGuides);
  }

  createMarking(center: Point, directionVector: Point): Target {
    return new Target(
      center,
      directionVector,
      this.world.roadWidth / 2,
      this.world.roadWidth / 2
    );
  }
}
