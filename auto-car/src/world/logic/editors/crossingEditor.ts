import { MarkingEditor } from './markingEditor';
import { Crossing } from '../markings/crossing';
import { World } from '../world';
import { Point } from '../primitives/point';
import type { Viewport } from '../viewport';

export class CrossingEditor extends MarkingEditor {
  constructor(
    viewport: Viewport,
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
