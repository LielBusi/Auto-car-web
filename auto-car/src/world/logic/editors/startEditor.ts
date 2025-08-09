import { Viewport } from "../viewport";
import { World } from "../world";
import { Point } from "../primitives/point";
import { MarkingEditor } from "./markingEditor";
import { Start } from "../markings/start";

export class StartEditor extends MarkingEditor {
  constructor(viewport: Viewport, world: World) {
    super(viewport, world, world.laneGuides);
  }

  createMarking(center: Point, directionVector: Point): Start {
    return new Start(
      center,
      directionVector,
      this.world.roadWidth / 2,
      this.world.roadWidth / 2
    );
  }
}
