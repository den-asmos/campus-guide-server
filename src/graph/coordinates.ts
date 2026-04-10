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
	return `${segment.x1},${segment.y1} ${segment.x1},${segment.y1} ${segment.x2},${segment.y2} ${segment.x2},${segment.y2}`;
};

export const buildPathPolylines = (nodes: GraphNode[]): string[] => {
	if (nodes.length < 2) {
		return [];
	}

	const result: string[] = [];

	for (let i = 0; i < nodes.length - 1; i++) {
		const leg = buildLeg(nodes[i], nodes[i + 1]);

		result.push(toPolylinePoints(leg.first));
		if (leg.second) {
			result.push(toPolylinePoints(leg.second));
		}
	}

	return result;
};
