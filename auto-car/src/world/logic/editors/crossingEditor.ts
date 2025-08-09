import { MarkingEditor } from './markingEditor';
import { Crossing } from '../markings/crossing';
import { World } from '../world';
import { Point } from '../primitives/point';

export class CrossingEditor extends MarkingEditor {
  constructor(
    viewport: any, // replace with actual type
    world: World
  ) {
    super(viewport, world, world.graph.segments);
  }

  createMarking(center: Point, directionVector: Point): Crossing {
    return new Crossing(
      center,
      directionVector,
      this.world.roadWidth,
      this.world.roadWidth / 2
    );
  }
}
