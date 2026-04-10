import { buildPathPolylines } from "./coordinates";
import { getGraph } from "./loader";
import { findShortestPath } from "./shortestPathAlgorithm";

export const findPath = async (origin: string, destination: string) => {
	const graph = await getGraph();
	const path = findShortestPath(graph, origin, destination);

	if (!path) {
		throw new Error("Не удалось построить маршрут");
	}

	return {
		path: buildPathPolylines(path.map((p) => p.node)),
		nodes: path.map((p) => p.node),
		origin: path[0].node,
		destination: path[path.length - 1].node,
	};
};
