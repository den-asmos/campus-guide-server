import { Router } from "express";
import { TimetableController } from "../controllers/timetable";
import { authenticateJwt } from "../middlewares/auth";
import { requireRole } from "../middlewares/role";
import { validate } from "../middlewares/validation";
import { Role } from "../models/User";
import {
	getClassroomTimetableSchema,
	getGroupTimetableSchema,
} from "../schemas/timetable";

const router = Router();
const timetableController = new TimetableController();

router.use(authenticateJwt);

router.get(
	"/group",
	validate({ query: getGroupTimetableSchema }),
	timetableController.getGroupTimetable
);
router.get(
	"/lecturer",
	requireRole([Role.lecturer]),
	timetableController.getLecturerTimetable
);
router.get(
	"/classroom",
	validate({ query: getClassroomTimetableSchema }),
	timetableController.getClassroomTimetable
);

export default router;
