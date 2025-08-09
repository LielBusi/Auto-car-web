import { Marking, type MarkingInfo } from "./marking";
import { Crossing } from "./crossing";
import { Light } from "./light";
import { Parking } from "./parking";
import { Start } from "./start";
import { Stop } from "./stop";
import { Target } from "./target";
import { Yield } from "./yield";
import { Point } from "../primitives/point";

export function loadMarking(info: MarkingInfo): Marking | undefined {
  const point = new Point(info.center.x, info.center.y);
  const dir = new Point(info.directionVector.x, info.directionVector.y);

  switch (info.type) {
    case "crossing":
      return new Crossing(point, dir, info.width, info.height);
    case "light":
      return new Light(point, dir, info.width, info.height);
    case "marking":
      return new Marking(point, dir, info.width, info.height);
    case "parking":
      return new Parking(point, dir, info.width, info.height);
    case "start":
      return new Start(point, dir, info.width, info.height);
    case "stop":
      return new Stop(point, dir, info.width, info.height);
    case "target":
      return new Target(point, dir, info.width, info.height);
    case "yield":
      return new Yield(point, dir, info.width, info.height);
    default:
      return undefined;
  }
}
