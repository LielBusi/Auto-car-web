import NeuralNetwork from "../geneticAlgorithm/network";
import { Sensor } from "./sensor";
import { Point } from "../world/logic/primitives/point";
import { Controls, type ControlType } from "./controls";

interface Border extends Array<Point> {}
interface Polygon extends Array<Point> {}

// Main Car class
export default class Car {
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public angle: number;

  private speed: number = 0;
  private acceleration: number = 0.2;
  private maxSpeed: number;
  private friction: number = 0.05;
  private damaged: boolean = false;

  public fitness: number = 0;
  private useBrain: boolean;

  private sensor?: Sensor;
  private brain?: NeuralNetwork;
  private controls: Controls;

  private polygon!: Polygon;

  private img: HTMLImageElement;
  private mask: HTMLCanvasElement;

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    controlType: ControlType,
    angle: number = 0,
    maxSpeed: number = 3,
    color: string = "blue"
  ) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.angle = angle;
    this.maxSpeed = maxSpeed;

    this.useBrain = controlType === ControlType.AI;

    if (controlType !== ControlType.DUMMY) {
      this.sensor = new Sensor(this);
      this.brain = new NeuralNetwork([this.sensor.rayCount, 6, 4]);
    }

    this.controls = new Controls(controlType);

    this.img = new Image();
    this.img.src = "car.png";

    this.mask = document.createElement("canvas");
    this.mask.width = width;
    this.mask.height = height;

    const maskCtx = this.mask.getContext("2d");
    this.img.onload = () => {
      if (!maskCtx) return;
      maskCtx.fillStyle = color;
      maskCtx.fillRect(0, 0, width, height);
      maskCtx.globalCompositeOperation = "destination-atop";
      maskCtx.drawImage(this.img, 0, 0, width, height);
    };
  }

  public update(roadBorders: Border[], traffic: Car[]): void {
    if (!this.damaged) {
      this.move();
      this.fitness += this.speed;
      this.polygon = this.createPolygon();
      this.damaged = this.assessDamage(roadBorders, traffic);
    }

    if (this.sensor) {
      this.sensor.update(roadBorders, traffic);
      const offsets = this.sensor.readings.map((s) =>
        s == null ? 0 : 1 - s.offset
      );
      const outputs = NeuralNetwork.feedForward(offsets, this.brain!);

      if (this.useBrain) {
        this.controls.forward = outputs[0];
        this.controls.left = outputs[1];
        this.controls.right = outputs[2];
        this.controls.reverse = outputs[3];
      }
    }
  }

  private assessDamage(roadBorders: Border[], traffic: Car[]): boolean {
    for (const border of roadBorders) {
      if (polysIntersect(this.polygon, border)) {
        return true;
      }
    }

    for (const other of traffic) {
      if (polysIntersect(this.polygon, other.polygon)) {
        return true;
      }
    }

    return false;
  }

  private createPolygon(): Polygon {
    const points: Polygon = [];
    const radius = Math.hypot(this.width, this.height) / 2;
    const alpha = Math.atan2(this.width, this.height);

    points.push({
      x: this.x - Math.sin(this.angle - alpha) * radius,
      y: this.y - Math.cos(this.angle - alpha) * radius,
    });

    points.push({
      x: this.x - Math.sin(this.angle + alpha) * radius,
      y: this.y - Math.cos(this.angle + alpha) * radius,
    });

    points.push({
      x: this.x - Math.sin(Math.PI + this.angle - alpha) * radius,
      y: this.y - Math.cos(Math.PI + this.angle - alpha) * radius,
    });

    points.push({
      x: this.x - Math.sin(Math.PI + this.angle + alpha) * radius,
      y: this.y - Math.cos(Math.PI + this.angle + alpha) * radius,
    });

    return points;
  }

  private move(): void {
    if (this.controls.forward) {
      this.speed += this.acceleration;
    }
    if (this.controls.reverse) {
      this.speed -= this.acceleration;
    }

    this.speed = Math.max(
      Math.min(this.speed, this.maxSpeed),
      -this.maxSpeed / 2
    );

    if (this.speed > 0) this.speed -= this.friction;
    if (this.speed < 0) this.speed += this.friction;

    if (Math.abs(this.speed) < this.friction) this.speed = 0;

    if (this.speed !== 0) {
      const flip = this.speed > 0 ? 1 : -1;
      if (this.controls.left) this.angle += 0.03 * flip;
      if (this.controls.right) this.angle -= 0.03 * flip;
    }

    this.x -= Math.sin(this.angle) * this.speed;
    this.y -= Math.cos(this.angle) * this.speed;
  }

  public draw(
    ctx: CanvasRenderingContext2D,
    drawSensor: boolean = false
  ): void {
    if (this.sensor && drawSensor) {
      this.sensor.draw(ctx);
    }

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(-this.angle);

    if (!this.damaged) {
      ctx.drawImage(
        this.mask,
        -this.width / 2,
        -this.height / 2,
        this.width,
        this.height
      );
      ctx.globalCompositeOperation = "multiply";
    }

    ctx.drawImage(
      this.img,
      -this.width / 2,
      -this.height / 2,
      this.width,
      this.height
    );
    ctx.restore();
  }
}
