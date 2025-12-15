import { Request, Response } from "express";
import { Faculty, Group } from "../models/User";
import { TimetableService } from "../services/timetable";

export class TimetableController {
	private timetableService: TimetableService;

	constructor() {
		this.timetableService = new TimetableService();
	}

	getGroupTimetable = async (req: Request, res: Response) => {
		try {
			const query = {
				faculty: req.validatedQuery.faculty as Faculty,
				course: Number(req.validatedQuery.course),
				group: req.validatedQuery.group as Group,
			};
			const timetable = await this.timetableService.getGroupTimetable(query);
			res.json(timetable);
		} catch (error: any) {
			res.status(500).json({
				message: "Ошибка получения расписания",
				error: error.message,
			});
		}
	};

	getLecturerTimetable = async (req: Request, res: Response) => {
		try {
			const query = {
				firstName: req.user!.firstName,
				lastName: req.user!.lastName,
				middleName: req.user!.middleName,
			};
			const timetable = await this.timetableService.getLecturerTimetable(query);
			res.json(timetable);
		} catch (error: any) {
			res.status(500).json({
				message: "Ошибка получения расписания",
				error: error.message,
			});
		}
	};

	getClassroomTimetable = async (req: Request, res: Response) => {
		try {
			const classroom = req.validatedQuery.classroom as string;
			const timetable = await this.timetableService.getClassroomTimetable(
				classroom
			);
			res.json(timetable);
		} catch (error: any) {
			res.status(500).json({
				message: "Ошибка получения расписания",
				error: error.message,
			});
		}
	};
}
