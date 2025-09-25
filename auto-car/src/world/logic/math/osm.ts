import { Point } from '../primitives/point';
import { Segment } from '../primitives/segment';
import { degToRad, invLerp } from './utils'; 

interface OsmNode {
  type: 'node';
  id: number | string;
  lat: number;
  lon: number;
}

interface OsmWay {
  type: 'way';
  nodes: (number | string)[];
  tags: {
    oneway?: boolean | string;
    lanes?: number | string;
    [key: string]: any;
  };
}

interface OsmData {
  elements: (OsmNode | OsmWay)[];
}

interface OsmParseResult {
  points: Point[];
  segments: Segment[];
}

export const Osm = {
  parseRoads(data: OsmData): OsmParseResult {
    const nodes = data.elements.filter((n): n is OsmNode => n.type === 'node');

    const lats = nodes.map(n => n.lat);
    const lons = nodes.map(n => n.lon);

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);

    const deltaLat = maxLat - minLat;
    const deltaLon = maxLon - minLon;
    const ar = deltaLon / deltaLat;
    const height = deltaLat * 111000 * 10;
    const width = height * ar * Math.cos(degToRad(maxLat));

    const points: Point[] = [];
    const segments: Segment[] = [];

    for (const node of nodes) {
      const y = invLerp(maxLat, minLat, node.lat) * height;
      const x = invLerp(minLon, maxLon, node.lon) * width;
      const point = new Point(x, y);
      point.id = node.id; // Add id dynamically, adjust if Point supports id
      points.push(point);
    }

    const ways = data.elements.filter((w): w is OsmWay => w.type === 'way');
    for (const way of ways) {
      const ids = way.nodes;
      for (let i = 1; i < ids.length; i++) {
        const prev = points.find(p => (p as any).id === ids[i - 1]);
        const cur = points.find(p => (p as any).id === ids[i]);
        if (!prev || !cur) continue;

        // Convert oneway to boolean; string "true"/"false" may appear in OSM data
        const oneWay =
          way.tags.oneway === true ||
          way.tags.oneway === "yes" ||
          way.tags.oneway === "true" ||
          way.tags.lanes === 1 ||
          way.tags.lanes === "1";

        segments.push(new Segment(prev, cur, oneWay));
      }
    }

    return { points, segments };
  },
};
