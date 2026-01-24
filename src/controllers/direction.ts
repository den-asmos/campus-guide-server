import { Request, Response } from "express";
import { DirectionService } from "../services/direction";

export class DirectionController {
	private directionService: DirectionService;

	constructor() {
		this.directionService = new DirectionService();
	}

	getDirection = async (req: Request, res: Response) => {
		try {
			const direction = await this.directionService.getDirection(req.validatedQuery);
			res.json(direction);
		} catch (error: any) {
			res.status(500).json({
				message: "Ошибка при построении маршрута",
				error: error.message,
			});
		}
	};
}
