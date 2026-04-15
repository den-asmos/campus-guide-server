import { getGraph } from "./loader";
import { findShortestPath, groupByFloor } from "./shortestPathAlgorithm";

export const findPath = async (origin: string, destination: string) => {
	const graph = await getGraph();
	const nodes = findShortestPath(graph, origin, destination);

	if (!nodes) {
		throw new Error("Не удалось построить маршрут");
	}

	return {
		groups: groupByFloor(nodes),
		origin: nodes[0],
		destination: nodes[nodes.length - 1],
	};
};
