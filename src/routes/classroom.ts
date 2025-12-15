import { Router } from "express";
import { ClassroomController } from "../controllers/classroom";
import { authenticateJwt } from "../middlewares/auth";
import { validate } from "../middlewares/validation";
import {
  getClassroomSchema,
  getFloorClassroomsSchema,
} from "../schemas/classroom";

const router = Router();
const classroomController = new ClassroomController();

router.use(authenticateJwt);

router.get(
	"/title",
	validate({ query: getClassroomSchema }),
	classroomController.getClassroomByTitle
);
router.get(
	"/floor",
	validate({ query: getFloorClassroomsSchema }),
	classroomController.getAllFloorClassrooms
);
router.get("/", classroomController.getAllClassrooms);

export default router;