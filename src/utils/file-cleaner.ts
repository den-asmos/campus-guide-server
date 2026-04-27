import dayjs from "dayjs";
import fs from "fs";
import logger from "./logger";

export class FileCleaner {
	constructor(private readonly maxAgeInDays: number = 7) {}

	cleanDirectory(filePaths: string[]) {
		for (const filePath of filePaths) {
			this.deleteIfStale(filePath);
		}
	}

	private deleteIfStale(filePath: string) {
		try {
			const stats = fs.statSync(filePath);
			if (!stats.isFile()) {
				return;
			}

			const ageInDays = dayjs().diff(dayjs(stats.mtime), "day");
			if (ageInDays <= this.maxAgeInDays) {
				return;
			}

			fs.unlinkSync(filePath);
			logger.info(`[File Cleaner] Deleted stale file: ${filePath}`);
		} catch (error) {
			logger.error(`[File Cleaner] Error deleting file ${filePath}: ${error}`);
		}
	}
}
