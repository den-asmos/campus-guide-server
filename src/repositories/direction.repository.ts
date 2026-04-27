import fs from "fs/promises";
import path from "path";
import { z } from "zod";
import { FloorFileSchema, LocationLinksSchema } from "../schemas/graph.schema";
import { GraphEdge, GraphNode } from "../utils/direction/types";
import logger from "../utils/logger";

const GRAPH_DIR = path.join(process.cwd(), "graph");
const FLOORS_DIR = path.join(GRAPH_DIR, "floors");
const LINKS_PATH = path.join(GRAPH_DIR, "locationLinks.json");

export class DirectionRepository {
	async loadFloorConnectors(
		nodes: Map<string, GraphNode>,
		edges: GraphEdge[],
	): Promise<void> {
		const fileNames = await fs.readdir(FLOORS_DIR);

		await Promise.all(
			fileNames.map(async (fileName) => {
				const raw = JSON.parse(
					await fs.readFile(path.join(FLOORS_DIR, fileName), "utf8"),
				);
				const parsed = FloorFileSchema.safeParse(raw);

				if (!parsed.success) {
					logger.warn(
						`[Graph] Skipping invalid floor file "${fileName}": ${z.treeifyError(parsed.error)}`,
					);
					return;
				}

				const { connectors, edges: floorEdges } = parsed.data;
				const connectorIds = new Set(connectors.map((c) => c.id));

				for (const connector of connectors) {
					if (!nodes.has(connector.id)) {
						nodes.set(connector.id, connector);
					}
				}

				for (const edge of floorEdges) {
					if (!connectorIds.has(edge.from) || !connectorIds.has(edge.to)) {
						logger.warn(
							`[Graph] Edge "${edge.from}" -> "${edge.to}" in "${fileName}" references unknown connector(s) — skipping`,
						);
						continue;
					}
					edges.push(edge);
				}
			}),
		);
	}

	async loadLocationLinks(
		nodes: Map<string, GraphNode>,
		edges: GraphEdge[],
	): Promise<void> {
		const raw = JSON.parse(await fs.readFile(LINKS_PATH, "utf-8"));
		const parsed = LocationLinksSchema.safeParse(raw);

		if (!parsed.success) {
			logger.error(
				`[Graph] locationLinks.json is invalid:`,
				z.treeifyError(parsed.error),
			);
			return;
		}

		for (const [locationId, connectorId] of Object.entries(parsed.data)) {
			const missing: string[] = [];
			if (!nodes.has(locationId)) {
				missing.push(`location "${locationId}"`);
			}
			if (!nodes.has(connectorId)) {
				missing.push(`connector "${connectorId}"`);
			}

			if (missing.length > 0) {
				logger.warn(
					`[Graph] locationLinks: cannot resolve ${missing.join(" and ")} — skipping link`,
				);
				continue;
			}

			edges.push({ from: locationId, to: connectorId, weight: 1 });
		}
	}
}
