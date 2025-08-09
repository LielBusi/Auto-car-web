import { Viewport } from "../viewport";
import { Point } from "../primitives/point";
import { Segment } from "../primitives/segment";
import { Graph } from "../math/graph";
import { getNearestPoint } from "../math/utils";

export class GraphEditor {
  private viewport: Viewport;
  private canvas: HTMLCanvasElement;
  private graph: Graph;
  private ctx: CanvasRenderingContext2D | null;

  private selected: Point | null;
  private hovered: Point | null;
  private dragging: boolean;
  private mouse: Point | null;

  private boundMouseDown!: (evt: MouseEvent) => void;
  private boundMouseMove!: (evt: MouseEvent) => void;
  private boundMouseUp!: (evt: MouseEvent) => void;
  private boundContextMenu!: (evt: MouseEvent) => void;

  constructor(viewport: Viewport, graph: Graph) {
    this.viewport = viewport;
    this.canvas = viewport.canvas;
    this.graph = graph;

    this.ctx = this.canvas.getContext("2d");

    this.selected = null;
    this.hovered = null;
    this.dragging = false;
    this.mouse = null;
  }

  enable(): void {
    this.#addEventListeners();
  }

  disable(): void {
    this.#removeEventListeners();
    this.selected = null;
    this.hovered = null;
  }

  #addEventListeners(): void {
    this.boundMouseDown = this.#handleMouseDown.bind(this);
    this.boundMouseMove = this.#handleMouseMove.bind(this);
    this.boundMouseUp = () => (this.dragging = false);
    this.boundContextMenu = (evt: MouseEvent) => evt.preventDefault();

    this.canvas.addEventListener("mousedown", this.boundMouseDown);
    this.canvas.addEventListener("mousemove", this.boundMouseMove);
    this.canvas.addEventListener("mouseup", this.boundMouseUp);
    this.canvas.addEventListener("contextmenu", this.boundContextMenu);
  }

  #removeEventListeners(): void {
    this.canvas.removeEventListener("mousedown", this.boundMouseDown);
    this.canvas.removeEventListener("mousemove", this.boundMouseMove);
    this.canvas.removeEventListener("mouseup", this.boundMouseUp);
    this.canvas.removeEventListener("contextmenu", this.boundContextMenu);
  }

  #handleMouseMove(evt: MouseEvent): void {
    this.mouse = this.viewport.getMouse(evt, true);
    this.hovered = getNearestPoint(
      this.mouse,
      this.graph.points,
      10 * this.viewport.zoom
    );
    if (this.dragging && this.selected && this.mouse) {
      this.selected.x = this.mouse.x;
      this.selected.y = this.mouse.y;
    }
  }

  #handleMouseDown(evt: MouseEvent): void {
    if (!this.mouse) return;

    if (evt.button === 2) {
      // right click
      if (this.selected) {
        this.selected = null;
      } else if (this.hovered) {
        this.#removePoint(this.hovered);
      }
    }

    if (evt.button === 0) {
      // left click
      if (this.hovered) {
        this.#select(this.hovered);
        this.dragging = true;
        return;
      }
      this.graph.addPoint(this.mouse);
      this.#select(this.mouse);
      this.hovered = this.mouse;
    }
  }

  #select(point: Point): void {
    if (this.selected) {
      this.graph.tryAddSegment(new Segment(this.selected, point));
    }
    this.selected = point;
  }

  #removePoint(point: Point): void {
    this.graph.removePoint(point);
    this.hovered = null;
    if (this.selected === point) {
      this.selected = null;
    }
  }

  dispose(): void {
    this.graph.dispose();
    this.selected = null;
    this.hovered = null;
  }

  display(): void {
    if (!this.ctx) return;

    this.graph.draw(this.ctx);

    if (this.hovered) {
      this.hovered.draw(this.ctx, { fill: true });
    }
    if (this.selected) {
      const intent = this.hovered ?? this.mouse;
      if (intent) {
        new Segment(this.selected, intent).draw(this.ctx, { dash: [3, 3] });
      }
      this.selected.draw(this.ctx, { outline: true });
    }
  }
}
