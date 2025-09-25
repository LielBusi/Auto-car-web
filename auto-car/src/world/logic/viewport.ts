import { Point } from "./primitives/point";
import { add, subtract, scale } from "./math/utils";

export class Viewport {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;

  public zoom: number;
  public center: Point;
  public offset: Point;

  public drag: {
    start: Point;
    end: Point;
    offset: Point;
    active: boolean;
  };

  public constructor(canvas: HTMLCanvasElement, zoom: number = 1, offset: Point | null = null) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D context");
    this.ctx = ctx;

    this.zoom = zoom;
    this.center = new Point(canvas.width / 2, canvas.height / 2);
    this.offset = offset ? offset : scale(this.center, -1);

    this.drag = {
      start: new Point(0, 0),
      end: new Point(0, 0),
      offset: new Point(0, 0),
      active: false,
    };

    this.#addEventListeners();
  }

  reset(): void {
    this.ctx.restore();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.save();
    this.ctx.translate(this.center.x, this.center.y);
    this.ctx.scale(1 / this.zoom, 1 / this.zoom);
    const offset = this.getOffset();
    this.ctx.translate(offset.x, offset.y);
  }

  getMouse(evt: MouseEvent, subtractDragOffset = false): Point {
    const p = new Point(
      (evt.offsetX - this.center.x) * this.zoom - this.offset.x,
      (evt.offsetY - this.center.y) * this.zoom - this.offset.y
    );
    return subtractDragOffset ? subtract(p, this.drag.offset) : p;
  }

  getOffset(): Point {
    return add(this.offset, this.drag.offset);
  }

  #addEventListeners(): void {
    this.canvas.addEventListener("wheel", this.#handleMouseWheel.bind(this));
    this.canvas.addEventListener("mousedown", this.#handleMouseDown.bind(this));
    this.canvas.addEventListener("mousemove", this.#handleMouseMove.bind(this));
    this.canvas.addEventListener("mouseup", this.#handleMouseUp.bind(this));
  }

  #handleMouseDown(evt: MouseEvent): void {
    if (evt.button === 2 || evt.button === 1) {
      evt.preventDefault();

      // right click or middle button on mouse
      this.drag.start = this.getMouse(evt);
      this.drag.active = true;
    }
  }

  #handleMouseMove(evt: MouseEvent): void {
    evt.preventDefault();

    if (this.drag.active) {
      this.drag.end = this.getMouse(evt);
      this.drag.offset = subtract(this.drag.end, this.drag.start);
    }
  }

  #handleMouseUp(evt: MouseEvent): void {
    if (this.drag.active) {
      evt.preventDefault();
      this.offset = add(this.offset, this.drag.offset);
      this.drag = {
        start: new Point(0, 0),
        end: new Point(0, 0),
        offset: new Point(0, 0),
        active: false,
      };
    }
  }

  #handleMouseWheel(evt: WheelEvent): void {
    evt.preventDefault();
    const dir = Math.sign(evt.deltaY);
    const step = 0.1;
    this.zoom += dir * step;
    this.zoom = Math.max(1, Math.min(5, this.zoom));
  }
}