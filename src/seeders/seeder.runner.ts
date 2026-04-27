import logger from "../utils/logger";
import { ClassroomSeeder } from "./classroom.seeder";

export class SeederRunner {
	static async run(): Promise<void> {
		logger.info("[Seeder] Running startup seed check...");
		try {
			await ClassroomSeeder.seed();
			logger.info("[Seeder] Done");
		} catch (error) {
			logger.error("[Seeder] Failed:", error);
			throw error;
		}
	}
}
