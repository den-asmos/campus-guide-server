import fs from "fs";
import path from "path";
import { z } from "zod";
import { ClassroomRepository } from "../repositories/classroom";
import { FloorFileSchema, LocationLinksSchema } from "../schemas/graph";
import { floorChangePenalty } from "./penalties";
import { Adjacency, Graph, GraphEdge, GraphNode, NodeType } from "./types";

const GRAPH_DIR = path.join(process.cwd(), "graph");
const FLOORS_DIR = path.join(GRAPH_DIR, "floors");
const LOCATION_LINKS_PATH = path.join(GRAPH_DIR, "locationLinks.json");

const loadFloorConnectors = (
	nodes: Map<string, GraphNode>,
	edges: GraphEdge[],
) => {
	const floorFiles = fs.readdirSync(FLOORS_DIR);

	for (const fileName of floorFiles) {
		const raw = JSON.parse(
			fs.readFileSync(path.join(FLOORS_DIR, fileName), "utf8"),
		);

		const parsed = FloorFileSchema.safeParse(raw);
		if (!parsed.success) {
			console.warn(
				`[graph] Skipping invalid floor file "${fileName}":`,
				z.treeifyError(parsed.error),
			);
			continue;
		}

		const { connectors, edges: floorEdges } = parsed.data;

		for (const connector of connectors) {
			if (nodes.has(connector.id)) {
				continue;
			}
			nodes.set(connector.id, connector);
		}

		const connectorIds = new Set(connectors.map((c) => c.id));
		for (const edge of floorEdges) {
			if (!connectorIds.has(edge.from) || !connectorIds.has(edge.to)) {
				console.warn(
					`[graph] Edge "${edge.from}" -> "${edge.to}" in "${fileName}" references unknown connector(s) — skipping`,
				);
				continue;
			}
			edges.push(edge);
		}
	}
};

const loadClassroomNodes = async (
	nodes: Map<string, GraphNode>,
): Promise<void> => {
	const classroomRepository = new ClassroomRepository();
	const classrooms = await classroomRepository.findAll();

	for (const classroom of classrooms) {
		if (nodes.has(classroom.id)) {
			console.warn(
				`[graph] Classroom id "${classroom.id}" collides with an existing node — skipping`,
			);
			continue;
		}

		nodes.set(classroom.id, {
			id: classroom.id,
			title: classroom.title,
			description: classroom.description,
			floor: classroom.floor,
			latitude: classroom.latitude,
			longitude: classroom.longitude,
			type: NodeType.classroom,
		});
	}
};

const loadLocationLinks = (
	nodes: Map<string, GraphNode>,
	edges: GraphEdge[],
) => {
	const raw = JSON.parse(fs.readFileSync(LOCATION_LINKS_PATH, "utf-8"));
	const parsed = LocationLinksSchema.safeParse(raw);

	if (!parsed.success) {
		console.error(
			`[graph] locationLinks.json is invalid:`,
			z.treeifyError(parsed.error),
		);
		return;
	}

	for (const [locationId, connectorId] of Object.entries(parsed.data)) {
		const missingNodes: string[] = [];
		if (!nodes.has(locationId)) {
			missingNodes.push(`location "${locationId}"`);
		}
		if (!nodes.has(connectorId)) {
			missingNodes.push(`connector "${connectorId}"`);
		}

		if (missingNodes.length > 0) {
			console.warn(
				`[graph] locationLinks: cannot resolve ${missingNodes.join(" and ")} — skipping link`,
			);
			continue;
		}

		edges.push({ from: locationId, to: connectorId, weight: 1 });
	}
};

const buildAdjacency = (
	nodes: Map<string, GraphNode>,
	edges: GraphEdge[],
): Adjacency => {
	const adjacency: Adjacency = new Map();

	for (const id of nodes.keys()) {
		adjacency.set(id, []);
	}

	for (const edge of edges) {
		const fromNode = nodes.get(edge.from);
		const toNode = nodes.get(edge.to);

		if (!fromNode || !toNode) {
			console.warn(
				`[graph] Adjacency: edge "${edge.from}" -> "${edge.to}" references unknown node(s) — skipping`,
			);
			continue;
		}

		const penalty = floorChangePenalty(fromNode, toNode);
		const weight = edge.weight + penalty;

		adjacency.get(edge.from)!.push({ to: edge.to, weight });
		adjacency.get(edge.to)!.push({ to: edge.from, weight });
	}

	return adjacency;
};

const buildGraph = async (): Promise<Graph> => {
	const nodes = new Map<string, GraphNode>();
	const edges: GraphEdge[] = [];

	loadFloorConnectors(nodes, edges);
	await loadClassroomNodes(nodes);
	loadLocationLinks(nodes, edges);

	const adjacency = buildAdjacency(nodes, edges);

	return { nodes, adjacency };
};

let cachedGraph: Graph | null = null;

export const getGraph = async (): Promise<Graph> => {
	if (!cachedGraph) {
		cachedGraph = await buildGraph();
	}
	return cachedGraph;
};
