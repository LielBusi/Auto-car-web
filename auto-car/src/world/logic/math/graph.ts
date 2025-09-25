import { PathPoint } from "../primitives/PathPoint";
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

  getSegmentsLeavingFromPoint(point: Point): Segment[] {
    const segs: Segment[] = [];

    for (const seg of this.segments as Segment[]) {
      if (seg.oneWay) {
        if (seg.p1.equals(point)) {
          segs.push(seg);
        }
      } else {
        if (seg.includes(point)) {
          segs.push(seg);
        }
      }
    }

    return segs;
  }

  getShortestPath(start: Point, end: Point): Point[] {
    // Create a fresh set of PathPoints
    const pathPoints: PathPoint[] = this.points.map(
      (p) => new PathPoint(p.x, p.y, Number.MAX_SAFE_INTEGER, false, null)
    );

    // Find corresponding PathPoint instances for start and end
    let currentPoint: PathPoint = pathPoints.find((pp) => pp.equals(start))!;
    const endPoint: PathPoint = pathPoints.find((pp) => pp.equals(end))!;

    currentPoint.dist = 0;

    while (!endPoint.visited) {
      const segs: Segment[] = this.getSegmentsLeavingFromPoint(currentPoint);

      for (const seg of segs) {
        // ✅ pick the other endpoint of the segment
        const neighbor = seg.p1.equals(currentPoint) ? seg.p2 : seg.p1;

        // ✅ find the corresponding PathPoint for that neighbor
        const otherPoint: PathPoint | undefined = pathPoints.find((pp) =>
          pp.equals(neighbor)
        );
        if (!otherPoint) continue;

        const newDist = currentPoint.dist + seg.length();
        if (newDist < otherPoint.dist) {
          otherPoint.dist = newDist;
          otherPoint.prev = currentPoint;
        }
      }

      currentPoint.visited = true;

      const unvisited: PathPoint[] = pathPoints.filter((p) => !p.visited);
      if (unvisited.length === 0) break; // ✅ avoid infinite loop if disconnected graph

      const minDist = Math.min(...unvisited.map((p) => p.dist));
      currentPoint = unvisited.find((p) => p.dist === minDist)!;
    }

    // Reconstruct path
    const path: Point[] = [];
    let backtrack: PathPoint | null = endPoint;

    while (backtrack) {
      path.unshift(new Point(backtrack.x, backtrack.y));
      backtrack = backtrack.prev;
    }

    return path;
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
