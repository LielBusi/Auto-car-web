import { Viewport } from "../viewport";
import { World } from "../world";
import { Segment } from "../primitives/segment";
import { Point } from "../primitives/point";
import { Marking } from "../markings/marking";
import { getNearestSegment } from "../math/utils";

export class MarkingEditor {
  private viewport: Viewport;
  private world: World;

  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;

  mouse: Point | null = null;
  intent: Marking | null = null;

  targetSegments: Segment[];

  markings: Marking[];

  private boundMouseDown!: (evt: MouseEvent) => void;
  private boundMouseMove!: (evt: MouseEvent) => void;
  private boundContextMenu!: (evt: MouseEvent) => void;

  constructor(viewport: Viewport, world: World, targetSegments: Segment[]) {
    this.viewport = viewport;
    this.world = world;

    this.canvas = viewport.canvas;
    const context = this.canvas.getContext("2d");
    if (!context) throw new Error("Failed to get 2D context");
    this.ctx = context;

    this.targetSegments = targetSegments;
    this.markings = world.markings;
  }

  // to be overwritten in subclasses
  createMarking(center: Point, directionVector: Point): Marking | null {
    return null;
  }

  enable(): void {
    this.#addEventListeners();
  }

  disable(): void {
    this.#removeEventListeners();
  }

  #addEventListeners(): void {
    this.boundMouseDown = this.#handleMouseDown.bind(this);
    this.boundMouseMove = this.#handleMouseMove.bind(this);
    this.boundContextMenu = (evt: MouseEvent) => evt.preventDefault();

    this.canvas.addEventListener("mousedown", this.boundMouseDown);
    this.canvas.addEventListener("mousemove", this.boundMouseMove);
    this.canvas.addEventListener("contextmenu", this.boundContextMenu);
  }

  #removeEventListeners(): void {
    this.canvas.removeEventListener("mousedown", this.boundMouseDown);
    this.canvas.removeEventListener("mousemove", this.boundMouseMove);
    this.canvas.removeEventListener("contextmenu", this.boundContextMenu);
  }

  #handleMouseMove(evt: MouseEvent): void {
    this.mouse = this.viewport.getMouse(evt, true);
    const seg = getNearestSegment(
      this.mouse,
      this.targetSegments,
      10 * this.viewport.zoom
    );
    if (seg) {
      const proj = seg.projectPoint(this.mouse);
      if (proj.offset >= 0 && proj.offset <= 1) {
        const newMarking = this.createMarking(
          proj.point,
          seg.directionVector()
        );
        this.intent = newMarking;
      } else {
        this.intent = null;
      }
    } else {
      this.intent = null;
    }
  }

  #handleMouseDown(evt: MouseEvent): void {
    if (evt.button === 0) {
      // left click
      if (this.intent) {
        this.markings.push(this.intent);
        this.intent = null;
      }
    }
    if (evt.button === 2) {
      // right click
      if (!this.mouse) return;
      for (let i = 0; i < this.markings.length; i++) {
        const poly = this.markings[i].poly;
        if (poly.containsPoint(this.mouse)) {
          this.markings.splice(i, 1);
          return;
        }
      }
    }
  }

  display(): void {
    if (this.intent) {
      this.intent.draw(this.ctx);
    }
  }
}
