import { ClassroomAttributes, Floor } from "../models/Classroom";

export enum NodeType {
	classroom = "classroom",
	connector = "connector",
	stairs = "stairs",
	elevator = "elevator",
}

export type GraphNode = ClassroomAttributes & {
	type: NodeType;
};

export type GraphEdge = {
	from: string;
	to: string;
	weight: number;
};

export type Graph = {
	nodes: Map<string, GraphNode>;
	adjacency: Adjacency;
};

export type FloorFile = {
	connectors: GraphNode[];
	edges: GraphEdge[];
};

export type LocationLinks = Record<string, string>;

export type Adjacency = Map<string, { to: string; weight: number }[]>;

export type FloorGroup = {
	floor: Floor;
	path: string;
	nodes: GraphNode[];
	origin: GraphNode;
	destination: GraphNode;
};
