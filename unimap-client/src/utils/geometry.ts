/** Convert a closed polygon to WKT POLYGON string */
export function polygonToWKT(points: [number, number][]): string {
    if (points.length < 3) return "";
    const ring = [...points, points[0]];
    const coords = ring.map(([x, y]) => `${x} ${y}`).join(", ");
    return `POLYGON((${coords}))`;
}

/** Convert a point to WKT POINT string */
export function pointToWKT(x: number, y: number): string {
    return `POINT(${x} ${y})`;
}

/** Convert a polyline to WKT LINESTRING string */
export function lineToWKT(points: [number, number][]): string {
    if (points.length < 2) return "";
    const coords = points.map(([x, y]) => `${x} ${y}`).join(", ");
    return `LINESTRING(${coords})`;
}

/** Generate polygon points for a rectangle given two corners */
export function rectToPolygonPoints(
    x1: number, y1: number,
    x2: number, y2: number
): [number, number][] {
    return [
        [x1, y1],
        [x2, y1],
        [x2, y2],
        [x1, y2],
    ];
}

/** Generate polygon points approximating a circle */
export function circleToPolygonPoints(
    cx: number, cy: number,
    r: number,
    segments: number = 32
): [number, number][] {
    const pts: [number, number][] = [];
    for (let i = 0; i < segments; i++) {
        const angle = (2 * Math.PI * i) / segments;
        pts.push([
            cx + r * Math.cos(angle),
            cy + r * Math.sin(angle),
        ]);
    }
    return pts;
}

/** Euclidean distance between two points */
export function calcDistance(
    p1: [number, number],
    p2: [number, number]
): number {
    return Math.sqrt((p2[0] - p1[0]) ** 2 + (p2[1] - p1[1]) ** 2);
}

/** Centroid of a polygon */
export function polygonCentroid(
    points: [number, number][]
): [number, number] {
    if (points.length === 0) return [0, 0];
    const sum = points.reduce(
        (acc, p) => [acc[0] + p[0], acc[1] + p[1]] as [number, number],
        [0, 0] as [number, number]
    );
    return [sum[0] / points.length, sum[1] / points.length];
}

/** ray casting point-in-polygon test */
export function pointInPolygon(
    point: [number, number],
    polygon: [number, number][]
): boolean {
    const [px, py] = point;
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const [xi, yi] = polygon[i];
        const [xj, yj] = polygon[j];
        if (
            yi > py !== yj > py &&
            px < ((xj - xi) * (py - yi)) / (yj - yi) + xi
        ) {
            inside = !inside;
        }
    }
    return inside;
}
