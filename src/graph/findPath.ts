import { loadGraph } from "./loadGraph";
import { shortestPathAlgorithm } from "./shortestPathAlgorithm";
import { Graph } from "./types";

let graph: Graph | null = null;

export const findPath = async (origin: string, destination: string) => {
	if (!graph) {
		graph = await loadGraph();
	}

	const path = shortestPathAlgorithm(graph, origin, destination);

	if (!path) {
		throw new Error("Не удалось построить маршрут");
	}

	const nodes = path.map((title) => graph!.nodes.get(title));

	return { path, nodes };
};
