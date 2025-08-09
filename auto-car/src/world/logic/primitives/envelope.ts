import { Segment } from "./segment";
import { Polygon } from "./polygon";
import { angle, subtract, translate } from "../math/utils"; 

export class Envelope {
  skeleton!: Segment;
  poly!: Polygon;

  constructor(skeleton?: Segment, width?: number, roundness = 1) {
    if (skeleton && width !== undefined) {
      this.skeleton = skeleton;
      this.poly = this.#generatePolygon(width, roundness);
    }
  }

  static load(info: { skeleton: { p1: any; p2: any }; poly: any }): Envelope {
    const env = new Envelope();
    env.skeleton = new Segment(info.skeleton.p1, info.skeleton.p2);
    env.poly = Polygon.load(info.poly);
    return env;
  }

  #generatePolygon(width: number, roundness: number): Polygon {
    const { p1, p2 } = this.skeleton;

    const radius = width / 2;
    const alpha = angle(subtract(p1, p2));
    const alpha_cw = alpha + Math.PI / 2;
    const alpha_ccw = alpha - Math.PI / 2;

    const points: any[] = [];
    const step = Math.PI / Math.max(1, roundness);
    const eps = step / 2;
    for (let i = alpha_ccw; i <= alpha_cw + eps; i += step) {
      points.push(translate(p1, i, radius));
    }
    for (let i = alpha_ccw; i <= alpha_cw + eps; i += step) {
      points.push(translate(p2, Math.PI + i, radius));
    }

    return new Polygon(points);
  }

  draw(
    ctx: CanvasRenderingContext2D,
    options?: Parameters<Polygon["draw"]>[1]
  ): void {
    this.poly.draw(ctx, options);
  }
}
