import Classroom from "../models/Classroom";

export class ClassroomRepository {
	async findById(id: number) {
		return await Classroom.findByPk(id);
	}

	async findByTitle(title: string) {
		return await Classroom.findOne({ where: { title } });
	}

	async findAllByFloor(floor: number) {
		return await Classroom.findAll({ where: { floor } });
	}

	async findAll() {
		return await Classroom.findAll();
	}
}
