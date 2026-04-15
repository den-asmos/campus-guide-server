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

const VERTICAL_TYPES = new Set<NodeType>([NodeType.stairs, NodeType.elevator]);

type SegmentAxis = "horizontal" | "vertical";

const axisOf = (node: GraphNode): SegmentAxis => {
	return VERTICAL_TYPES.has(node.type) ? "vertical" : "horizontal";
};

export const buildLeg = (a: GraphNode, b: GraphNode): PathLeg => {
	const ax = a.latitude;
	const ay = a.longitude;
	const bx = b.latitude;
	const by = b.longitude;

	if (ay === by) {
		const segment: LineSegment = { x1: ax, y1: ay, x2: bx, y2: by };
		return { first: segment, second: null, cornerX: bx, cornerY: by };
	}

	if (ax === bx) {
		const segment: LineSegment = { x1: ax, y1: ay, x2: bx, y2: by };
		return { first: segment, second: null, cornerX: bx, cornerY: by };
	}

	const pivot = a.type !== NodeType.classroom ? a : b;
	const axis = axisOf(pivot);

	let cornerX: number;
	let cornerY: number;

	if (axis === "horizontal") {
		cornerX = bx;
		cornerY = ay;
	} else {
		cornerX = ax;
		cornerY = by;
	}

	const first: LineSegment = { x1: ax, y1: ay, x2: cornerX, y2: cornerY };
	const second: LineSegment = { x1: cornerX, y1: cornerY, x2: bx, y2: by };

	return { first, second, cornerX, cornerY };
};

const toPolylinePoints = (segment: LineSegment): string => {
	return `${segment.x1},${segment.y1} ${segment.x2},${segment.y2}`;
};

export const legToPolylinePoints = (leg: PathLeg): string => {
	const start = `${leg.first.x1},${leg.first.y1}`;
	const end = `${(leg.second ?? leg.first).x2},${(leg.second ?? leg.first).y2}`;

	if (!leg.second) {
		return `${start} ${end}`;
	}

	return `${start} ${leg.cornerX},${leg.cornerY} ${end}`;
};

export const buildContinuousPolyline = (nodes: GraphNode[]): string => {
	if (nodes.length === 0) {
		return "";
	}
	if (nodes.length === 1) {
		return `${nodes[0].latitude},${nodes[0].longitude}`;
	}

	const points: string[] = [`${nodes[0].latitude},${nodes[0].longitude}`];

	for (let i = 0; i < nodes.length - 1; i++) {
		const leg = buildLeg(nodes[i], nodes[i + 1]);

		if (leg.second) {
			points.push(`${leg.cornerX},${leg.cornerY}`);
		}

		const end = leg.second ?? leg.first;
		points.push(`${end.x2},${end.y2}`);
	}

	return points.join(" ");
};
