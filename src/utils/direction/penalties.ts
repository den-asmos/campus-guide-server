import { GraphNode, NodeType } from "./types";

export const FLOOR_CHANGE_PENALTY: Record<string, number> = {
	[NodeType.stairs]: 8,
	[NodeType.elevator]: 5,
};

export const floorChangePenalty = (a: GraphNode, b: GraphNode): number => {
	if (a.floor === b.floor) {
		return 0;
	}

	const interFloorNode = [a, b].find(
		(n) => n.type === NodeType.stairs || n.type === NodeType.elevator,
	);
	if (!interFloorNode) {
		return 0;
	}

	return FLOOR_CHANGE_PENALTY[interFloorNode.type] ?? 0;
};
