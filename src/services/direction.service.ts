import { AppError } from "../errors/app-error";
import { ClassroomRepository } from "../repositories/classroom.repository";
import { DirectionRepository } from "../repositories/direction.repository";
import { findShortestPath, groupByFloor } from "../utils/direction/dijkstra";
import { floorChangePenalty } from "../utils/direction/penalties";
import {
	Adjacency,
	FloorGroup,
	Graph,
	GraphEdge,
	GraphNode,
	NodeType,
} from "../utils/direction/types";
import logger from "../utils/logger";

interface FindPath {
	groups: FloorGroup[];
	origin: GraphNode;
	destination: GraphNode;
}

export class DirectionService {
	private cachedGraph: Graph | null = null;

	constructor(
		private graphRepository: DirectionRepository,
		private classroomRepository: ClassroomRepository,
	) {}

	async findPath(originId: string, destinationId: string): Promise<FindPath> {
		const graph = await this.getGraph();
		const nodes = findShortestPath(graph, originId, destinationId);

		if (!nodes) {
			throw new AppError(
				"Не удалось построить маршрут между заданными узлами",
				404,
				"NO_PATH_FOUND",
			);
		}

		return {
			groups: groupByFloor(nodes),
			origin: nodes[0],
			destination: nodes[nodes.length - 1],
		};
	}

	invalidateCache() {
		this.cachedGraph = null;
		logger.info("[Graph] Cache invalidated");
	}

	private async getGraph(): Promise<Graph> {
		if (!this.cachedGraph) {
			this.cachedGraph = await this.buildGraph();
		}
		return this.cachedGraph;
	}

	private async buildGraph(): Promise<Graph> {
		const nodes = new Map<string, GraphNode>();
		const edges: GraphEdge[] = [];

		await this.graphRepository.loadFloorConnectors(nodes, edges);
		await this.loadClassroomNodes(nodes);
		await this.graphRepository.loadLocationLinks(nodes, edges);

		return { nodes, adjacency: this.buildAdjacency(nodes, edges) };
	}

	private async loadClassroomNodes(
		nodes: Map<string, GraphNode>,
	): Promise<void> {
		const classrooms = await this.classroomRepository.findAll();

		for (const classroom of classrooms) {
			if (nodes.has(classroom.id)) {
				logger.warn(
					`[Graph] Classroom id "${classroom.id}" collides with an existing node — skipping`,
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
	}

	private buildAdjacency(
		nodes: Map<string, GraphNode>,
		edges: GraphEdge[],
	): Adjacency {
		const adjacency: Adjacency = new Map();
		for (const id of nodes.keys()) {
			adjacency.set(id, []);
		}

		for (const edge of edges) {
			const fromNode = nodes.get(edge.from);
			const toNode = nodes.get(edge.to);

			if (!fromNode || !toNode) {
				logger.warn(
					`[Graph] Adjacency: edge "${edge.from}" -> "${edge.to}" references unknown node(s) — skipping`,
				);
				continue;
			}

			const weight = edge.weight + floorChangePenalty(fromNode, toNode);
			adjacency.get(edge.from)!.push({ to: edge.to, weight });
			adjacency.get(edge.to)!.push({ to: edge.from, weight });
		}

		return adjacency;
	}
}
