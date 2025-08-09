import { Point } from "../primitives/point";
import { Segment } from "../primitives/segment";

export class Graph {
  points: Point[];
  segments: Segment[];

  constructor(points: Point[] = [], segments: Segment[] = []) {
    this.points = points;
    this.segments = segments;
  }

  static load(info: {
    points: { x: number; y: number }[];
    segments: { p1: { x: number; y: number }; p2: { x: number; y: number } }[];
  }): Graph {
    const points = info.points.map((i) => new Point(i.x, i.y));

    const segments = info.segments.map((i) => {
      const p1 = new Point(i.p1.x, i.p1.y);
      const p2 = new Point(i.p2.x, i.p2.y);
      const point1 = points.find((p) => p.equals(p1));
      const point2 = points.find((p) => p.equals(p2));
      if (!point1 || !point2) {
        throw new Error("Point in segment not found in points array");
      }
      return new Segment(point1, point2);
    });
    return new Graph(points, segments);
  }

  hash(): string {
    return JSON.stringify(this);
  }

  addPoint(point: Point): void {
    this.points.push(point);
  }

  containsPoint(point: Point): Point | undefined {
    return this.points.find((p) => p.equals(point));
  }

  tryAddPoint(point: Point): boolean {
    if (!this.containsPoint(point)) {
      this.addPoint(point);
      return true;
    }
    return false;
  }

  removePoint(point: Point): void {
    const segs = this.getSegmentsWithPoint(point);
    for (const seg of segs) {
      this.removeSegment(seg);
    }
    const idx = this.points.indexOf(point);
    if (idx !== -1) {
      this.points.splice(idx, 1);
    }
  }

  addSegment(seg: Segment): void {
    this.segments.push(seg);
  }

  containsSegment(seg: Segment): Segment | undefined {
    return this.segments.find((s) => s.equals(seg));
  }

  tryAddSegment(seg: Segment): boolean {
    if (!this.containsSegment(seg) && !seg.p1.equals(seg.p2)) {
      this.addSegment(seg);
      return true;
    }
    return false;
  }

  removeSegment(seg: Segment): void {
    const idx = this.segments.indexOf(seg);
    if (idx !== -1) {
      this.segments.splice(idx, 1);
    }
  }

  getSegmentsWithPoint(point: Point): Segment[] {
    const segs: Segment[] = [];
    for (const seg of this.segments) {
      if (seg.includes(point)) {
        segs.push(seg);
      }
    }
    return segs;
  }

  dispose(): void {
    this.points.length = 0;
    this.segments.length = 0;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    for (const seg of this.segments) {
      seg.draw(ctx);
    }
    for (const point of this.points) {
      point.draw(ctx);
    }
  }
}
