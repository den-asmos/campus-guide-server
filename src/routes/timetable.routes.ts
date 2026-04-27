import { Router } from "express";
import { TimetableController } from "../controllers/timetable.controller";
import { authenticateJwt } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import { Role } from "../models/user.model";
import {
	timetableFileRepository,
	timetableScraperRepository,
} from "../repositories";
import {
	getClassroomTimetableSchema,
	getGroupTimetableSchema,
} from "../schemas/timetable.schema";
import { TimetableService } from "../services/timetable.service";
import { FileCleaner } from "../utils/file-cleaner";
import { TimetableCache } from "../utils/timetable/timetable-cache";
import { TimetableDownloader } from "../utils/timetable/timetable-downloader";
import { TimetableFilter } from "../utils/timetable/timetable-filter";
import { TimetableParser } from "../utils/timetable/timetable-parser";
import { TimetableScheduler } from "../utils/timetable/timetable-scheduler";

const router = Router();

const cache = new TimetableCache();
const cleaner = new FileCleaner();
const downloader = new TimetableDownloader(
	timetableScraperRepository,
	timetableFileRepository,
	cache,
	cleaner,
);
const timetableService = new TimetableService(
	downloader,
	new TimetableFilter(),
	new TimetableParser(),
	new TimetableScheduler(downloader),
);
const timetableController = new TimetableController(timetableService);

router.get(
	"/group",
	authenticateJwt,
	validate({ query: getGroupTimetableSchema }),
	timetableController.getGroupTimetable,
);
router.get(
	"/lecturer",
	authenticateJwt,
	requireRole([Role.lecturer]),
	timetableController.getLecturerTimetable,
);
router.get(
	"/classroom",
	authenticateJwt,
	validate({ query: getClassroomTimetableSchema }),
	timetableController.getClassroomTimetable,
);

export default router;
