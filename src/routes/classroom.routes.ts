import { Router } from "express";
import { ClassroomController } from "../controllers/classroom.controller";
import { authenticateJwt } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { classroomRepository } from "../repositories";
import {
	getAllByFloorSchema,
	getByTitleSchema,
	searchSchema,
} from "../schemas/classroom.schema";
import { ClassroomService } from "../services/classroom.service";

const router = Router();

const classroomService = new ClassroomService(classroomRepository);
const classroomController = new ClassroomController(classroomService);

router.get("/", authenticateJwt, classroomController.getAll);
router.get(
	"/floor",
	authenticateJwt,
	validate({ query: getAllByFloorSchema }),
	classroomController.getAllByFloor,
);
router.get(
	"/search",
	authenticateJwt,
	validate({ query: searchSchema }),
	classroomController.search,
);
router.get(
	"/title",
	authenticateJwt,
	validate({ query: getByTitleSchema }),
	classroomController.getByTitle,
);

export default router;
