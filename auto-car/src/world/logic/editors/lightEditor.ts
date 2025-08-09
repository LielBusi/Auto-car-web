import { Viewport } from "../viewport";
import { World } from "../world";
import { Point } from "../primitives/point";
import { MarkingEditor } from "./markingEditor";
import { Light } from "../markings/light";

export class LightEditor extends MarkingEditor {
  constructor(viewport: Viewport, world: World) {
    super(viewport, world, world.laneGuides);
  }

  createMarking(center: Point, directionVector: Point): Light {
    return new Light(
      center,
      directionVector,
      this.world.roadWidth / 2,
      this.world.roadWidth / 2
    );
  }
}
