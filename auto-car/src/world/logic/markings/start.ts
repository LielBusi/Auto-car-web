import { Marking } from "./marking";
import { Point } from "../primitives//point";
import { angle } from "../math/utils"; // Adjust path as needed
import carLogo from "../../../assets/car.png";

export class Start extends Marking {
  img: HTMLImageElement;

  constructor(
    center: Point,
    directionVector: Point,
    width: number,
    height: number
  ) {
    super(center, directionVector, width, height);

    this.img = new Image();
    this.img.src = carLogo;
    this.type = "start";
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(this.center.x, this.center.y);
    ctx.rotate(angle(this.directionVector) - Math.PI / 2);

    ctx.drawImage(this.img, -this.img.width / 2, -this.img.height / 2);

    ctx.restore();
  }
}
