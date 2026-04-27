import { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "../errors/app-error";
import { Faculty, Group } from "../models/user.model";
import { TimetableService } from "../services/timetable.service";
import { GroupTimetableDto } from "../types/timetable.types";

export class TimetableController {
	constructor(private timetableService: TimetableService) {}

	getGroupTimetable = async (
		req: Request,
		res: Response,
		next: NextFunction,
	) => {
		try {
			const dto: GroupTimetableDto = {
				faculty: req.validatedQuery.faculty as Faculty,
				course: Number(req.validatedQuery.course),
				group: req.validatedQuery.group as Group,
			};
			const timetable = await this.timetableService.getGroupTimetable(dto);
			res.json(timetable);
		} catch (error) {
			next(error);
		}
	};

	getLecturerTimetable = async (
		req: Request,
		res: Response,
		next: NextFunction,
	) => {
		try {
			if (!req.user) {
				return next(new UnauthorizedError("Требуется авторизация"));
			}

			const { firstName, lastName, middleName } = req.user;
			const timetable = await this.timetableService.getLecturerTimetable({
				firstName,
				lastName,
				middleName,
			});
			res.json(timetable);
		} catch (error) {
			next(error);
		}
	};

	getClassroomTimetable = async (
		req: Request,
		res: Response,
		next: NextFunction,
	) => {
		try {
			const classroom = req.validatedQuery.classroom as string;
			const timetable =
				await this.timetableService.getClassroomTimetable(classroom);
			res.json(timetable);
		} catch (error) {
			next(error);
		}
	};
}
