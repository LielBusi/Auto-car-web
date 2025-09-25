import { Segment } from "./segment";
import { Polygon } from "./polygon";
import { angle, subtract, translate } from "../math/utils"; 
import type { Point } from "./point";

/* Envelope defined by a skeleton (Segment) and a width, and a roundness factor
   Roundness defines how rounded the ends of the envelope are. */
export class Envelope {
  public skeleton!: Segment;
  public poly!: Polygon;

  public constructor(skeleton?: Segment, width?: number, roundness = 1) {
    if (skeleton && width !== undefined) {
      this.skeleton = skeleton;
      this.poly = this.generatePolygon(width, roundness);
    }
  }

  public static load(info: { skeleton: { p1: Point; p2: Point }; poly: Polygon }): Envelope {
    const env = new Envelope();
    env.skeleton = new Segment(info.skeleton.p1, info.skeleton.p2);
    env.poly = Polygon.load(info.poly);
    return env;
  }

  // Generate a polygon representing the envelope, given width and roundness
  private generatePolygon(width: number, roundness: number): Polygon {
    const { p1, p2 } = this.skeleton;

    const radius = width / 2;

    // Angle between p1 and p2
    const alpha = angle(subtract(p1, p2));

    // Clockwise and counter-clockwise angles perpendicular to the segment
    const alpha_cw = alpha + Math.PI / 2;
    const alpha_ccw = alpha - Math.PI / 2;

    const points: Point[] = [];
    
    // Add points along the rounded ends. step defines the size of the steps along the arc.
    const step = Math.PI / Math.max(1, roundness);
    // eps ensures we include the last point at alpha_cw
    const eps = step / 2;

    // Creates half circle from 9 to 3 o'clock and then from 3 to 9 o'clock
    for (let i = alpha_ccw; i <= alpha_cw + eps; i += step) {
      points.push(translate(p1, i, radius));
    }
    for (let i = alpha_ccw; i <= alpha_cw + eps; i += step) {
      points.push(translate(p2, Math.PI + i, radius));
    }

    return new Polygon(points);
  }

  public draw(ctx: CanvasRenderingContext2D, options?: Parameters<Polygon["draw"]>[1]): void {
    this.poly.draw(ctx, options);
  }
}
