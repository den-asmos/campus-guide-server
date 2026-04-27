import { NextFunction, Request, Response } from "express";
import { ClassroomService } from "../services/classroom.service";
import { SearchClassroomDto } from "../types/classroom.types";

export class ClassroomController {
	constructor(private classroomService: ClassroomService) {}

	getAll = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const classrooms = await this.classroomService.getAllClassrooms();
			res.json(classrooms);
		} catch (error) {
			next(error);
		}
	};

	getAllByFloor = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const classrooms = await this.classroomService.getAllClassroomsByFloor(
				Number(req.validatedQuery.floor),
			);
			res.json(classrooms);
		} catch (error) {
			next(error);
		}
	};

	search = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const dto: SearchClassroomDto = {
				query: req.validatedQuery.query as string,
				limit: Number(req.validatedQuery.limit) ?? undefined,
			};
			const result = await this.classroomService.searchClassroom(dto);
			res.json(result);
		} catch (error) {
			next(error);
		}
	};

	getByTitle = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const classroom = await this.classroomService.getClassroomByTitle(
				req.validatedQuery.title as string,
			);
			res.json(classroom);
		} catch (error) {
			next(error);
		}
	};
}
