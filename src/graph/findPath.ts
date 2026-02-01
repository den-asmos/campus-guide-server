import { loadGraph } from "./loadGraph";
import { shortestPathAlgorithm } from "./shortestPathAlgorithm";
import { DirectionNode, Graph, GraphNode } from "./types";

let graph: Graph | null = null;

const calculateLocationPoints = (first: GraphNode, second: GraphNode) => {
	const width = Math.abs(first.latitude - second.latitude);
	const x1 = Math.min(first.latitude, second.latitude);
	const x2 = x1 + width;
	const y1 =
		first.latitude < second.latitude ? first.longitude : second.longitude;
	const y2 =
		first.latitude < second.latitude ? second.longitude : first.longitude;

	return `${x1},${y1} ${x1},${y1} ${x2},${y2} ${x2},${y2}`;
};

const calculateStepPoints = (first: GraphNode, second: GraphNode) => {
	const height = Math.abs(first.longitude - second.longitude);
	const x = first.latitude;
	const y1 = Math.min(first.longitude, second.longitude);
	const y2 = y1 + height;

	return `${x},${y1} ${x},${y1} ${x},${y2} ${x},${y2}`;
};

export const findPath = async (origin: string, destination: string) => {
	if (!graph) {
		graph = await loadGraph();
	}

	const path = shortestPathAlgorithm(graph, origin, destination);

	if (!path) {
		throw new Error("Не удалось построить маршрут");
	}

	const allNodes = path.map((title) => graph!.nodes.get(title) as GraphNode);
	const nodes: DirectionNode[] = [];

	for (let i = 1; i < allNodes.length - 2; i++) {
		nodes.push({
			...allNodes[i],
			points: calculateStepPoints(allNodes[i + 1], allNodes[i]),
		});
	}

	return {
		path,
		nodes,
		origin: {
			...allNodes[0],
			points: calculateLocationPoints(allNodes[0], allNodes[1]),
		},
		destination: {
			...allNodes[allNodes.length - 1],
			points: calculateLocationPoints(
				allNodes[allNodes.length - 1],
				allNodes[allNodes.length - 2],
			),
		},
	};
};
