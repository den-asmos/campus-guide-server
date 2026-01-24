import { Router } from "express";
import { DirectionController } from "../controllers/direction";
import { authenticateJwt } from "../middlewares/auth";
import { validate } from "../middlewares/validation";
import { getDirectionSchema } from "../schemas/direction";

const router = Router();
const directionController = new DirectionController();

router.use(authenticateJwt);

router.get(
	"/",
	validate({ query: getDirectionSchema }),
	directionController.getDirection
);

export default router;
