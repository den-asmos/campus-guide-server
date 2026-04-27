import { Router } from "express";
import { DirectionController } from "../controllers/direction.controller";
import { authenticateJwt } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { classroomRepository, directionRepository } from "../repositories";
import { getDirectionSchema } from "../schemas/direction.schema";
import { DirectionService } from "../services/direction.service";

const router = Router();

const directionService = new DirectionService(
	directionRepository,
	classroomRepository,
);
const directionController = new DirectionController(directionService);

router.get(
	"/",
	authenticateJwt,
	validate({ query: getDirectionSchema }),
	directionController.getDirection,
);

export default router;
