import { Request, Response } from "express";
import { ClassroomService } from "../services/classroom";

export class ClassroomController {
	private classroomService: ClassroomService;

	constructor() {
		this.classroomService = new ClassroomService();
	}

	getClassroomByTitle = async (req: Request, res: Response) => {
		try {
			const classroom = await this.classroomService.getClassroomByTitle(
				req.validatedQuery.title
			);
			res.json(classroom);
		} catch (error: any) {
			res.status(404).json({
				message: "Аудитория не найдена",
				error: error.message,
			});
		}
	};

	getAllFloorClassrooms = async (req: Request, res: Response) => {
		try {
			const classrooms = await this.classroomService.getAllFloorClassrooms(
				req.validatedQuery.floor
			);
			res.json(classrooms);
		} catch (error: any) {
			res.status(500).json({
				message: "Ошибка получения данных об аудиториях",
				error: error.message,
			});
		}
	};

	getAllClassrooms = async (req: Request, res: Response) => {
		try {
			const classrooms = await this.classroomService.getAllClassrooms();
			res.json(classrooms);
		} catch (error: any) {
			res.status(500).json({
				message: "Ошибка получения данных об аудиториях",
				error: error.message,
			});
		}
	};
}
