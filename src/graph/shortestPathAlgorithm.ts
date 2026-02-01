import { Graph } from "./types";

export const shortestPathAlgorithm = (
	graph: Graph,
	origin: string,
	destination: string,
): string[] | null => {
	if (!graph.nodes.has(origin) || !graph.nodes.has(destination)) {
		return null;
	}

	if (origin === destination) {
		return [origin];
	}

	const minDistance = new Map<string, number>();
	const previous = new Map<string, string | null>();
	const unvisited = new Set<string>(graph.nodes.keys());

	for (const title of graph.nodes.keys()) {
		minDistance.set(title, Infinity);
		previous.set(title, null);
	}
	minDistance.set(origin, 0);

	while (unvisited.size > 0) {
		let current: string | null = null;
		let currentMinDistance = Infinity;

		for (const node of unvisited) {
			const distance = minDistance.get(node)!;
			if (distance < currentMinDistance) {
				currentMinDistance = distance;
				current = node;
			}
		}

		if (current === null || currentMinDistance === Infinity) {
			break;
		}

		if (current === destination) {
			break;
		}

		unvisited.delete(current);

		const neighbors = graph.adjacency.get(current);
		if (neighbors) {
			for (const { to, weight } of neighbors) {
				if (!unvisited.has(to)) {
					continue;
				}

				const alternative = currentMinDistance + weight;
				if (alternative < minDistance.get(to)!) {
					minDistance.set(to, alternative);
					previous.set(to, current);
				}
			}
		}
	}

	if (minDistance.get(destination) === Infinity) {
		return null;
	}

	const path: string[] = [];
	let current: string | null = destination;

	while (current !== null) {
		path.push(current);
		current = previous.get(current)!;
	}

	return path.reverse();
};
