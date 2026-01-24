import { ClassroomAttributes } from "../models/Classroom";

export enum NodeType {
	classroom,
	connector,
	stairs,
	elevator,
}

export type GraphNode = Omit<ClassroomAttributes, "id"> & {
	type: NodeType;
};

export type GraphEdge = {
	from: string;
	to: string;
	weight: number;
};

export type Graph = {
	nodes: Map<string, GraphNode>;
	edges: GraphEdge[];
	adjacency: Adjacency;
};

export type FloorFile = {
	connectors: GraphNode[];
	edges: GraphEdge[];
};

export type LocationLinks = Record<string, string>;

export type Adjacency = Map<string, { to: string; weight: number }[]>;
