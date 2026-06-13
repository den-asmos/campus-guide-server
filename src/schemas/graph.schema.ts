import { z } from "zod";
import { NodeType } from "../utils/direction/types";

const graphNodeTypeSchema = z.enum(NodeType);

export const connectorSchema = z.object({
  id: z.string().min(1).normalize(),
  title: z.string().min(1).normalize(),
  description: z.string().normalize(),
  type: graphNodeTypeSchema,
  floor: z.number().int().min(1).max(7),
  latitude: z.number(),
  longitude: z.number(),
});

export const graphEdgeSchema = z.object({
  from: z.string().min(1).normalize(),
  to: z.string().min(1).normalize(),
  weight: z.number().positive(),
});

export const floorFileSchema = z.object({
  connectors: z.array(connectorSchema),
  edges: z.array(graphEdgeSchema),
});

export const connectorFileSchema = z.object({
  connectors: z.array(connectorSchema),
});

export const LocationLinksSchema = z.record(z.string().normalize(), z.string().normalize());
