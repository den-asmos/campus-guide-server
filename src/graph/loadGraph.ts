import fs from "fs";
import path from "path";
import { ClassroomRepository } from "../repositories/classroom";
import { Adjacency, FloorFile, GraphEdge, GraphNode, RoomLinks } from "./types";

const classroomRepository = new ClassroomRepository();

export const loadGraph = async () => {
	const graphDirectory = path.join(process.cwd(), "graph");
	const floorsDirectory = path.join(graphDirectory, "floors");

	const floors = fs.readdirSync(floorsDirectory);

	const nodes: Map<string, GraphNode> = new Map();
	const edges: GraphEdge[] = [];

	for (const floor of floors) {
		const floorFile: FloorFile = JSON.parse(
			fs.readFileSync(path.join(floorsDirectory, floor), "utf8")
		);
		floorFile.connectors.forEach((connector) => {
			nodes.set(connector.title, connector);
		});
		edges.push(...floorFile.edges);
	}

	const classrooms = await classroomRepository.findAll();

	for (const classroom of classrooms) {
		nodes.set(classroom.title, {
			title: classroom.title,
			description: classroom.description,
			floor: classroom.floor,
			latitude: classroom.latitude,
			longitude: classroom.longitude,
			type: "classroom",
		});
	}

	const roomLinks: RoomLinks = JSON.parse(
		fs.readFileSync(path.join(graphDirectory, "roomLinks.json"), "utf8")
	);

	for (const [roomTitle, connectorTitle] of Object.entries(roomLinks)) {
		if (nodes.has(roomTitle) && nodes.has(connectorTitle)) {
			edges.push({
				from: roomTitle,
				to: connectorTitle,
				weight: 1,
			});
		}
	}

	const adjacency: Adjacency = new Map();

	for (const edge of edges) {
		if (!adjacency.has(edge.from)) {
			adjacency.set(edge.from, []);
		}
		if (!adjacency.has(edge.to)) {
			adjacency.set(edge.to, []);
		}

		adjacency.get(edge.from)?.push({ to: edge.to, weight: edge.weight });
		adjacency.get(edge.to)?.push({ to: edge.from, weight: edge.weight });
	}

	return { nodes, edges, adjacency };
};
