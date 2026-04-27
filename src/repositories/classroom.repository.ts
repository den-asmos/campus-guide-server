import { Op } from "sequelize";
import { Classroom } from "../models/classroom.model";

import { SearchClassroomDto } from "../types/classroom.types";
import { BaseRepository } from "./base.repository";

export class ClassroomRepository extends BaseRepository<Classroom> {
	constructor() {
		super(Classroom);
	}

	static async count(): Promise<number> {
		return Classroom.count();
	}

	static async bulkCreate(data: Record<string, string>[]): Promise<void> {
		const mapped = data.map((row) => ({
			id: row["id"],
			title: row["title"],
			description: row["description"],
			floor: parseInt(row["floor"]),
			latitude: parseInt(row["latitude"]),
			longitude: parseInt(row["longitude"]),
		}));

		await Classroom.bulkCreate(mapped, {
			ignoreDuplicates: true,
		});
	}

	async findByTitle(title: string): Promise<Classroom | null> {
		return Classroom.findOne({ where: { title } });
	}

	async findByTitleOrDescription({
		query,
		limit = 20,
	}: SearchClassroomDto): Promise<{
		classrooms: Classroom[];
		total: number;
		limit: number;
	}> {
		const trimmed = query.trim();

		const { rows, count } = await Classroom.findAndCountAll({
			where: {
				[Op.or]: [
					{ title: { [Op.iLike]: `%${trimmed}%` } },
					{ description: { [Op.iLike]: `%${trimmed}%` } },
				],
			},
			limit,
			order: [
				["title", "ASC"],
				["description", "ASC"],
			],
		});

		return { classrooms: rows, total: count, limit };
	}
}
