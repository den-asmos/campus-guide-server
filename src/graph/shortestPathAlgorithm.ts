import { Graph } from "./types";

export const shortestPathAlgorithm = (
	graph: Graph,
	origin: string,
	destination: string
) => {
	const minDistance = new Map<string, number>();
	const previous = new Map<string, string | null>();
	const visited = new Set<string>();

	for (const title of graph.nodes.keys()) {
		minDistance.set(title, Infinity);
		previous.set(title, null);
	}

	minDistance.set(origin, 0);

	while (true) {
		let current: string | null = null;
		let currentMinDistance = Infinity;

		for (const [title, distance] of minDistance.entries()) {
			if (!visited.has(title) && distance < currentMinDistance) {
				currentMinDistance = distance;
				current = title;
			}
		}

		if (current === null) {
			break;
		}
		if (current === destination) {
			break;
		}

		visited.add(current);

		const neighbors = graph.adjacency.get(current) || [];

		for (const { to, weight } of neighbors) {
			const alternative = minDistance.get(current)! + weight;

			if (alternative < minDistance.get(to)!) {
				minDistance.set(to, alternative);
				previous.set(to, current);
			}
		}
	}

	if (minDistance.get(destination) === Infinity) {
		return null;
	}

	const path: string[] = [];
	let pathPart: string | null = destination;

	while (pathPart !== null) {
		path.unshift(pathPart);
		pathPart = previous.get(pathPart)!;
	}

	return path;
};
