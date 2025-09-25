import { Point } from "../primitives/point.ts";
import { Segment } from "../primitives/segment.ts";

// Return nearest point from loc in points array, within an optional threshold distance.
export function getNearestPoint(
  loc: Point,
  points: Point[],
  // Threshold means the point must be within this distance to be considered.
  threshold: number = Number.MAX_SAFE_INTEGER
): Point | null {
  let minDist = Number.MAX_SAFE_INTEGER;
  let nearest: Point | null = null;
  for (const point of points) {
    const dist = distance(point, loc);
    if (dist < minDist && dist < threshold) {
      minDist = dist;
      nearest = point;
    }
  }
  return nearest;
}

// Return nearest segment from loc in segments array, within an optional threshold distance.
export function getNearestSegment(
  loc: Point,
  segments: Segment[],
  threshold: number = Number.MAX_SAFE_INTEGER
): Segment | null {
  let minDist = Number.MAX_SAFE_INTEGER;
  let nearest: Segment | null = null;
  for (const seg of segments) {
    const dist = seg.distanceToPoint(loc);
    if (dist < minDist && dist < threshold) {
      minDist = dist;
      nearest = seg;
    }
  }
  return nearest;
}

export function distance(p1: Point, p2: Point): number {
  return Math.hypot(p1.x - p2.x, p1.y - p2.y);
}

export function average(p1: Point, p2: Point): Point {
  return new Point((p1.x + p2.x) / 2, (p1.y + p2.y) / 2);
}

export function dot(p1: Point, p2: Point): number {
  return p1.x * p2.x + p1.y * p2.y;
}

export function add(p1: Point, p2: Point): Point {
  return new Point(p1.x + p2.x, p1.y + p2.y);
}

export function subtract(p1: Point, p2: Point): Point {
  return new Point(p1.x - p2.x, p1.y - p2.y);
}

export function scale(p: Point, scaler: number): Point {
  return new Point(p.x * scaler, p.y * scaler);
}

// Normalize a point treated as a vector from origin to length 1.
export function normalize(p: Point): Point {
  return scale(p, 1 / magnitude(p));
}

// Magnitude (length) of a point treated as a vector from origin.
export function magnitude(p: Point): number {
  return Math.hypot(p.x, p.y);
}

export function perpendicular(p: Point): Point {
  return new Point(-p.y, p.x);
}

// Translate a point by angle (radians) and offset, returning a new point with offset distance from loc at the given angle.
export function translate(loc: Point, angle: number, offset: number): Point {
  return new Point(
    loc.x + Math.cos(angle) * offset,
    loc.y + Math.sin(angle) * offset
  );
}

export function angle(p: Point): number {
  return Math.atan2(p.y, p.x);
}

// Get intersection point of two line segments AB and CD, or null if none.
export function getIntersection(
  A: Point,
  B: Point,
  C: Point,
  D: Point
): { x: number; y: number; offset: number } | null {
  const tTop = (D.x - C.x) * (A.y - C.y) - (D.y - C.y) * (A.x - C.x);
  const uTop = (C.y - A.y) * (A.x - B.x) - (C.x - A.x) * (A.y - B.y);
  const bottom = (D.y - C.y) * (B.x - A.x) - (D.x - C.x) * (B.y - A.y);

  const eps = 0.001;
  if (Math.abs(bottom) > eps) {
    const t = tTop / bottom;
    const u = uTop / bottom;
    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
      return {
        x: lerp(A.x, B.x, t),
        y: lerp(A.y, B.y, t),
        offset: t,
      };
    }
  }
  return null;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function lerp2D(A: Point, B: Point, t: number): Point {
  return new Point(lerp(A.x, B.x, t), lerp(A.y, B.y, t));
}

export function invLerp(a: number, b: number, v: number): number {
  return (v - a) / (b - a);
}

export function degToRad(degree: number): number {
  return (degree * Math.PI) / 180;
}

export function getRandomColor(): string {
  const hue = 290 + Math.random() * 260;
  return `hsl(${hue}, 100%, 60%)`;
}

export function getFake3dPoint(
  point: Point,
  viewPoint: Point,
  height: number
): Point {
  const dir = normalize(subtract(point, viewPoint));
  const dist = distance(point, viewPoint);
  const scaler = Math.atan(dist / 300) / (Math.PI / 2);
  return add(point, scale(dir, height * scaler));
}

/**
 * Returns an RGBA string based on value polarity.
 * Negative = blue, Positive = red, Transparency = magnitude.
 */
export function getRGBA(value: number): string {
  const alpha = Math.abs(value);
  const R = value < 0 ? 0 : 255;
  const G = R;
  const B = value > 0 ? 0 : 255;
  return `rgba(${R},${G},${B},${alpha})`;
}

/**
 * Checks if two polygons intersect by checking all edge combinations.
 */
export function polysIntersect(poly1: Point[], poly2: Point[]): boolean {
  for (let i = 0; i < poly1.length; i++) {
    const a1 = poly1[i];
    const a2 = poly1[(i + 1) % poly1.length];

    for (let j = 0; j < poly2.length; j++) {
      const b1 = poly2[j];
      const b2 = poly2[(j + 1) % poly2.length];

      const touch = getIntersection(a1, a2, b1, b2);
      if (touch) {
        return true;
      }
    }
  }
  return false;
}
