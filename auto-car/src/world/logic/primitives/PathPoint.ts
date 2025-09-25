import { Point } from "./point";

export class PathPoint extends Point {
    public dist: number;
    public visited: boolean;
    public prev: PathPoint | null;
    
    constructor(x: number, y: number, dist:number, visited: boolean, prev: PathPoint | null) {
        super(x, y);
        this.dist = dist;
        this.visited = visited;
        this.prev = prev;
    }
}