import { AppError } from "../../errors/app-error";
import { buildContinuousPolyline } from "./coordinates";
import { MinHeap } from "./min-heap";
import { FloorGroup, Graph, GraphNode } from "./types";

type HeapEntry = {
	nodeId: string;
	distance: number;
};

const getNode = (graph: Graph, nodeId: string): GraphNode => {
	const node = graph.nodes.get(nodeId);
	if (!node) {
		throw new AppError(
			`Узел ${nodeId} не найден в графе`,
			500,
			"GRAPH_NODE_MISSING",
		);
	}

	return node;
};

export const findShortestPath = (
	graph: Graph,
	originId: string,
	destinationId: string,
): GraphNode[] | null => {
	if (!graph.nodes.has(originId) || !graph.nodes.has(destinationId)) {
		return null;
	}
	if (originId === destinationId) {
		return [getNode(graph, originId)];
	}

	const distance = new Map<string, number>();
	const previous = new Map<string, string | null>();

	for (const id of graph.nodes.keys()) {
		distance.set(id, Infinity);
		previous.set(id, null);
	}

	distance.set(originId, 0);

	const queue = new MinHeap<HeapEntry>((a, b) => a.distance - b.distance);
	queue.push({ nodeId: originId, distance: 0 });

	while (!queue.isEmpty) {
		const { nodeId: current, distance: currentDistance } = queue.pop()!;

		if (currentDistance > distance.get(current)!) {
			continue;
		}
		if (current === destinationId) {
			break;
		}

		for (const { to, weight } of graph.adjacency.get(current) ?? []) {
			const alternative = currentDistance + weight;
			if (alternative < distance.get(to)!) {
				distance.set(to, alternative);
				previous.set(to, current);
				queue.push({ nodeId: to, distance: alternative });
			}
		}
	}

	if (distance.get(destinationId) === Infinity) {
		return null;
	}

	const path: GraphNode[] = [];
	let current: string | null = destinationId;

	while (current !== null) {
		path.push(getNode(graph, current));
		current = previous.get(current) ?? null;
	}

	return path.reverse();
};

export const groupByFloor = (nodes: GraphNode[]): FloorGroup[] => {
	if (nodes.length === 0) {
		return [];
	}

	const groups: FloorGroup[] = [];
	let currentFloor = nodes[0].floor;
	let currentNodes: GraphNode[] = [];

	for (let i = 0; i < nodes.length; i++) {
		const node = nodes[i];

		if (node.floor !== currentFloor) {
			groups.push({
				floor: currentFloor,
				path: buildContinuousPolyline(currentNodes),
				origin: currentNodes[0],
				destination: currentNodes[currentNodes.length - 1],
			});

			currentFloor = node.floor;
			currentNodes = [];
		}

		currentNodes.push(node);
	}

	groups.push({
		floor: currentFloor,
		path: buildContinuousPolyline(currentNodes),
		origin: currentNodes[0],
		destination: currentNodes[currentNodes.length - 1],
	});

	return groups;
};
