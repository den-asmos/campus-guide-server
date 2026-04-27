import fs from "fs";
import path from "path";
import { timetableConfig } from "../../config/timetable.config";
import { AppError } from "../../errors/app-error";
import { Faculty } from "../../models/user.model";
import { TimetableFileRepository } from "../../repositories/timetable-file.repository";
import { TimetableScraperRepository } from "../../repositories/timetable-scraper.repository";
import { LinkInfo, TimetableDownload } from "../../types/timetable.types";
import { FileCleaner } from "../file-cleaner";
import logger from "../logger";
import { TimetableCache } from "./timetable-cache";

const DOWNLOADS_DIR = path.resolve(process.cwd(), "downloads");

export class TimetableDownloader {
	constructor(
		private scraperRepository: TimetableScraperRepository,
		private fileRepository: TimetableFileRepository,
		private cache: TimetableCache,
		private cleaner: FileCleaner,
	) {}

	async download(faculty: Faculty): Promise<TimetableDownload> {
		const cached = this.cache.get(faculty);
		if (cached) {
			return {
				filePaths: cached,
				multiple: timetableConfig[faculty].multiple,
				faculty,
			};
		}
		return this.downloadLatest(faculty);
	}

	async downloadAll(
		faculties: Faculty[] = Object.values(Faculty),
	): Promise<void> {
		const results = await Promise.allSettled(
			faculties.map((f) => this.download(f)),
		);

		results.forEach((result, index) => {
			if (result.status === "rejected") {
				logger.error(
					`[Timetable Downloader] Failed to download timetable for ${faculties[index]}: ${result.reason}`,
				);
			}
		});
	}

	private async downloadLatest(faculty: Faculty): Promise<TimetableDownload> {
		const links = await this.scraperRepository.getLinks(faculty);
		if (!links.length) {
			throw new AppError(
				`Не найдены ссылки на .xlsx файлы для факультета ${faculty}`,
			);
		}

		const directory = this.getFacultyDirectory(faculty);
		await fs.promises.mkdir(directory, { recursive: true });

		const filePaths = await Promise.all(
			links.map((link) => this.downloadFile(link, directory)),
		);

		this.cleaner.cleanDirectory(filePaths);
		this.cache.set(faculty, filePaths);

		return { filePaths, multiple: timetableConfig[faculty].multiple, faculty };
	}

	private async downloadFile(
		link: LinkInfo,
		directory: string,
	): Promise<string> {
		const outPath = path.join(directory, link.filename);
		const exists = await this.fileRepository.exists(outPath);
		if (!exists) {
			await this.fileRepository.download(link.href, outPath);
		}
		return outPath;
	}

	private getFacultyDirectory(faculty: Faculty): string {
		return path.join(DOWNLOADS_DIR, faculty);
	}
}
