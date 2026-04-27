import { NextFunction, Request, Response } from "express";
import { DirectionService } from "../services/direction.service";

export class DirectionController {
	constructor(private graphService: DirectionService) {}

	getDirection = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { origin, destination } = req.validatedQuery as {
				origin: string;
				destination: string;
			};
			const result = await this.graphService.findPath(origin, destination);
			res.json(result);
		} catch (error) {
			next(error);
		}
	};
}
