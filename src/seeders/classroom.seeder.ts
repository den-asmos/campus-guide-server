import { parse } from "csv-parse/sync";
import fs from "fs";
import path from "path";
import { ClassroomRepository } from "../repositories/classroom.repository";
import logger from "../utils/logger";

export class ClassroomSeeder {
	static async seed(): Promise<void> {
		const count = await ClassroomRepository.count();

		if (count > 0) {
			logger.info("[Classroom Seeder] Table already has data, skipping");
			return;
		}

		logger.info("[Classroom Seeder] Table is empty, seeding from CSV...");

		const csvPath = path.resolve(__dirname, "../../data/classroom.csv");
		const fileContent = fs.readFileSync(csvPath, "utf-8");

		const records: Record<string, string>[] = parse(fileContent, {
			columns: true,
			skip_empty_lines: true,
			trim: true,
		});

		await ClassroomRepository.bulkCreate(records);
		logger.info(`[Classroom Seeder] Inserted ${records.length} records`);
	}
}
