import { GraphNode, NodeType } from "./types";

type LineSegment = {
	x1: number;
	x2: number;
	y1: number;
	y2: number;
};

type PathLeg = {
	first: LineSegment;
	second: LineSegment | null;
	cornerX: number;
	cornerY: number;
};

type SegmentAxis = "horizontal" | "vertical";

const VERTICAL_TYPES = new Set<NodeType>([NodeType.stairs, NodeType.elevator]);

const axisOf = (node: GraphNode): SegmentAxis => {
	return VERTICAL_TYPES.has(node.type) ? "vertical" : "horizontal";
};

export const buildLeg = (a: GraphNode, b: GraphNode): PathLeg => {
	const [ax, ay, bx, by] = [a.latitude, a.longitude, b.latitude, b.longitude];

	if (ax === bx || ay === by) {
		const segment: LineSegment = { x1: ax, y1: ay, x2: bx, y2: by };
		return { first: segment, second: null, cornerX: bx, cornerY: by };
	}

	const pivot = a.type !== NodeType.classroom ? a : b;
	const axis = axisOf(pivot);

	const cornerX = axis === "horizontal" ? bx : ax;
	const cornerY = axis === "horizontal" ? ay : by;

	return {
		first: { x1: ax, y1: ay, x2: cornerX, y2: cornerY },
		second: { x1: cornerX, y1: cornerY, x2: bx, y2: by },
		cornerX,
		cornerY,
	};
};

const dedupeCollinear = (
	points: Array<[number, number]>,
): Array<[number, number]> => {
	if (points.length <= 2) {
		return points;
	}

	const result: Array<[number, number]> = [points[0]];

	for (let i = 1; i < points.length - 1; i++) {
		const [px, py] = result[result.length - 1];
		const [cx, cy] = points[i];
		const [nx, ny] = points[i + 1];

		const collinearX = px === cx && cx === nx;
		const collinearY = py === cy && cy === ny;

		if (collinearX || collinearY) {
			const isDetour =
				(collinearX && (cy < Math.min(py, ny) || cy > Math.max(py, ny))) ||
				(collinearY && (cx < Math.min(px, nx) || cx > Math.max(px, nx)));

			if (isDetour) {
				continue;
			}
		}

		result.push(points[i]);
	}

	result.push(points[points.length - 1]);
	return result;
};

export const buildContinuousPolyline = (nodes: GraphNode[]): string => {
	if (nodes.length === 0) {
		return "";
	}
	if (nodes.length === 1) {
		return `${nodes[0].latitude},${nodes[0].longitude}`;
	}

	const raw: Array<[number, number]> = [
		[nodes[0].latitude, nodes[0].longitude],
	];

	for (let i = 0; i < nodes.length - 1; i++) {
		const leg = buildLeg(nodes[i], nodes[i + 1]);
		if (leg.second) {
			raw.push([leg.cornerX, leg.cornerY]);
		}

		const end = leg.second ?? leg.first;
		raw.push([end.x2, end.y2]);
	}

	return dedupeCollinear(raw)
		.map(([x, y]) => `${x},${y}`)
		.join(" ");
};
