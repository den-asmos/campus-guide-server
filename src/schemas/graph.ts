import { z } from "zod";
import { NodeType } from "../graph/types";

const GraphNodeTypeSchema = z.enum(NodeType);

export const ConnectorSchema = z.object({
	id: z.string().min(1),
	title: z.string().min(1),
	description: z.string(),
	type: GraphNodeTypeSchema,
	floor: z.number().int().min(1).max(7),
	latitude: z.number(),
	longitude: z.number(),
});

export const GraphEdgeSchema = z.object({
	from: z.string().min(1),
	to: z.string().min(1),
	weight: z.number().positive(),
});

export const FloorFileSchema = z.object({
	connectors: z.array(ConnectorSchema),
	edges: z.array(GraphEdgeSchema),
});

export const ConnectorFileSchema = z.object({
	connectors: z.array(ConnectorSchema),
});

export const LocationLinksSchema = z.record(z.string(), z.string());
