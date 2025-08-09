import { Viewport } from "../viewport";
import { World } from "../world";
import { Point } from "../primitives/point";
import { MarkingEditor } from "./markingEditor";
import { Parking } from "../markings/parking";

export class ParkingEditor extends MarkingEditor {
  constructor(viewport: Viewport, world: World) {
    super(viewport, world, world.laneGuides);
  }

  createMarking(center: Point, directionVector: Point): Parking {
    return new Parking(
      center,
      directionVector,
      this.world.roadWidth / 2,
      this.world.roadWidth / 2
    );
  }
}
