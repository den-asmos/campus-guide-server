import { NotFoundError } from "../errors/app-error";
import { Classroom } from "../models/classroom.model";
import { ClassroomRepository } from "../repositories/classroom.repository";
import { SearchClassroomDto } from "../types/classroom.types";

export class ClassroomService {
	constructor(private classroomRepository: ClassroomRepository) {}

	async getAllClassrooms(): Promise<Classroom[]> {
		return await this.classroomRepository.findAll();
	}

	async getAllClassroomsByFloor(floor: number): Promise<Classroom[]> {
		return await this.classroomRepository.findAll({ floor });
	}

	async searchClassroom(
		dto: SearchClassroomDto,
	): Promise<{ classrooms: Classroom[]; total: number; limit: number }> {
		return await this.classroomRepository.findByTitleOrDescription(dto);
	}

	async getClassroomByTitle(title: string): Promise<Classroom> {
		const classroom = await this.classroomRepository.findByTitle(title);
		if (!classroom) {
			throw new NotFoundError("Аудитория не найдена");
		}
		return classroom;
	}
}
