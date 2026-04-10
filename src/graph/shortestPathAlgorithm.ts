import { MinHeap } from "./minHeap";
import { Graph, PathStep } from "./types";

type HeapEntry = {
	nodeId: string;
	distance: number;
};

const toStep = (graph: Graph, nodeId: string): PathStep => ({
	nodeId,
	node: graph.nodes.get(nodeId)!,
});

const reconstructPath = (
	graph: Graph,
	previous: Map<string, string | null>,
	destinationId: string,
): PathStep[] => {
	const path: PathStep[] = [];
	let current: string | null = destinationId;

	while (current !== null) {
		path.push(toStep(graph, current));
		current = previous.get(current) ?? null;
	}

	return path.reverse();
};

export const findShortestPath = (
	graph: Graph,
	originId: string,
	destinationId: string,
): PathStep[] | null => {
	if (!graph.nodes.has(originId) || !graph.nodes.has(destinationId)) {
		return null;
	}

	if (originId === destinationId) {
		return [toStep(graph, originId)];
	}

	const distance = new Map<string, number>();
	const previous = new Map<string, string | null>();

	for (const id of graph.nodes.keys()) {
		distance.set(id, Infinity);
		previous.set(id, null);
	}
	distance.set(originId, 0);

	const priorityQueue = new MinHeap<HeapEntry>(
		(a, b) => a.distance - b.distance,
	);
	priorityQueue.push({ nodeId: originId, distance: 0 });

	while (!priorityQueue.isEmpty) {
		const { nodeId: current, distance: currentDistance } = priorityQueue.pop()!;

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
				priorityQueue.push({ nodeId: to, distance: alternative });
			}
		}
	}

	if (distance.get(destinationId) === Infinity) {
		return null;
	}

	return reconstructPath(graph, previous, destinationId);
};
