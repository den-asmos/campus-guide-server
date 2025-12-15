import { ClassroomRepository } from "../repositories/classroom";

export class ClassroomService {
	private classroomRepository: ClassroomRepository;

	constructor() {
		this.classroomRepository = new ClassroomRepository();
	}

	getClassroomByTitle = async (title: string) => {
		const classroom = await this.classroomRepository.findByTitle(title);

		if (!classroom) {
			throw new Error("Аудитория не найдена");
		}

		return classroom;
	};

	getAllFloorClassrooms = async (floor: number) => {
		return await this.classroomRepository.findAllByFloor(floor);
	};

	getAllClassrooms = async () => {
		return await this.classroomRepository.findAll();
	};
}
