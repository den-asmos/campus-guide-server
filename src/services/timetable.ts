import dayjs from "dayjs";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { timetableConfig } from "../config/timetable";
import User, { Faculty, Group } from "../models/User";
import { TimetableRepository } from "../repositories/timetable";
import { ensureDirectoryExistence, getDownloadDirectory } from "../utils/file";
import { filterClassroomGroups, filterLecturerGroups } from "../utils/filter";
import { DaySchedule, TimetableParser } from "./../utils/timetableParser";

dotenv.config();

type GroupTimetableQuery = {
	faculty: Faculty;
	course: number;
	group: Group;
};

type LecturerTimetableQuery = Pick<
	User,
	"firstName" | "lastName" | "middleName"
>;

type TimetableDownloadResult = {
	filePaths: string[];
	multiple: boolean;
	faculty: Faculty;
};

type TimetableCache = {
	lastCheck: string;
	filePaths: string[];
};

export class TimetableService {
	private cache = new Map<Faculty, TimetableCache>();
	private readonly cacheTimeLimit = 12 * 60 * 60 * 1000;
	private isRefreshing = false;

	private timetableRepository: TimetableRepository;
	private timetableParser: TimetableParser;

	constructor() {
		this.timetableRepository = new TimetableRepository();
		this.timetableParser = new TimetableParser();
		this.startRefresh();
	}

	private startRefresh = () => {
		setInterval(() => {
			this.refresh();
		}, 24 * 60 * 60 * 1000);
	};

	private refresh = async () => {
		if (this.isRefreshing) {
			return;
		}

		this.isRefreshing = true;
		try {
			console.log("Refresh started...");
			await this.ensureTimetablesReady();
			console.log("Refresh completed");
		} catch (error) {
			console.error(`Refresh failed: ${error}`);
		} finally {
			this.isRefreshing = false;
		}
	};

	ensureTimetablesReady = async (
		faculties: Faculty[] = Object.values(Faculty)
	) => {
		const downloadPromises = faculties.map((faculty) =>
			this.downloadLatest(faculty)
		);
		await Promise.all(downloadPromises);
	};

	getGroupTimetable = async (query: GroupTimetableQuery) => {
		try {
			await this.ensureTimetablesReady([query.faculty]);

			const downloads = await this.getCachedOrDownload(query.faculty);
			const result = this.parseTimetableFiles(downloads);

			return result.map((day) => ({
				...day,
				groups: day.groups.filter(
					(group) =>
						group.course === query.course && group.groupName === query.group
				),
			}));
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	getLecturerTimetable = async (query: LecturerTimetableQuery) => {
		try {
			await this.ensureTimetablesReady();

			const lecturer = `${query.lastName} ${query.firstName[0]}. ${query.middleName[0]}.`;

			const allFaculties = Object.values(Faculty);
			const timetableDays: DaySchedule[] = [];

			for (const faculty of allFaculties) {
				const downloads = await this.getCachedOrDownload(faculty);
				const timetable = this.parseTimetableFiles(downloads);
				timetableDays.push(...timetable);
			}

			const result = this.mergeTimetableDays(timetableDays);

			return result.map((day) => ({
				...day,
				groups: filterLecturerGroups(day.groups, lecturer),
			}));
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	getClassroomTimetable = async (query: string) => {
		try {
			await this.ensureTimetablesReady();

			const classroom = query.toLowerCase();

			const allFaculties = Object.values(Faculty);
			const timetableDays: DaySchedule[] = [];

			for (const faculty of allFaculties) {
				const downloads = await this.getCachedOrDownload(faculty);
				const timetable = this.parseTimetableFiles(downloads);
				timetableDays.push(...timetable);
			}

			const result = this.mergeTimetableDays(timetableDays);

			return result.map((day) => ({
				...day,
				groups: filterClassroomGroups(day.groups, classroom),
			}));
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	private getCachedOrDownload = async (faculty: Faculty) => {
		const cached = this.cache.get(faculty);

		if (
			cached &&
			dayjs().diff(cached.lastCheck, "milliseconds") < this.cacheTimeLimit
		) {
			return {
				filePaths: cached.filePaths,
				multiple: timetableConfig[faculty].multiple,
				faculty,
			};
		}

		return await this.downloadLatest(faculty);
	};

	private downloadLatest = async (faculty: Faculty) => {
		const links = await this.timetableRepository.getLinks(faculty);

		if (!links || links.length === 0) {
			throw new Error(
				`Для факультета ${faculty} не найдено .xlsx ссылок на странице`
			);
		}

		const directory = getDownloadDirectory();
		ensureDirectoryExistence(directory);

		this.deleteOldest(directory);

		const multiple = timetableConfig[faculty].multiple;
		const result: TimetableDownloadResult = {
			filePaths: [],
			multiple,
			faculty,
		};

		const downloadPromises = links.map(async (link) => {
			const outPath = path.join(directory, link.filename);
			const fileExists = await this.timetableRepository.fileExists(outPath);

			if (!fileExists) {
				await this.timetableRepository.downloadFile(link.href, outPath);
			}

			return outPath;
		});

		result.filePaths = await Promise.all(downloadPromises);

		this.cache.set(faculty, {
			lastCheck: dayjs().toISOString(),
			filePaths: result.filePaths,
		});

		return result;
	};

	private deleteOldest = (directory: string) => {
		try {
			const files = fs.readdirSync(directory);

			for (const file of files) {
				const filePath = path.join(directory, file);
				const stats = fs.statSync(filePath);

				if (stats.isFile()) {
					const lastModified = dayjs(stats.mtime);
					const ageInDays = dayjs().diff(lastModified, "day");

					if (ageInDays > 7) {
						fs.unlink(filePath, (error) => {
							if (error) {
								console.error(`Error deleting file: ${error}`);
							} else {
								console.log("File deleted successfully");
							}
						});
					}
				}
			}
		} catch (error) {
			console.error(`Error reading directory: ${error}`);
		}
	};

	private parseTimetableFiles = (
		downloads: TimetableDownloadResult
	): DaySchedule[] => {
		const result: DaySchedule[] = [];

		if (downloads.multiple) {
			const timetableDays: DaySchedule[] = [];

			for (const filePath of downloads.filePaths) {
				const timetable = this.timetableParser.parseTimetable(filePath);
				timetableDays.push(...timetable);
			}

			result.push(...this.mergeTimetableDays(timetableDays));
		} else {
			const timetable = this.timetableParser.parseTimetable(
				downloads.filePaths[0]
			);
			result.push(...timetable);
		}

		return result;
	};

	private mergeTimetableDays = (timetableDays: DaySchedule[]) => {
		const result: DaySchedule[] = [];

		timetableDays.forEach((timetableDay) => {
			const existingTimetableDayIndex = result.findIndex(
				(day) => day.date === timetableDay.date
			);

			if (existingTimetableDayIndex === -1) {
				result.push(timetableDay);
			} else {
				result[existingTimetableDayIndex].groups.push(...timetableDay.groups);
			}
		});

		return result;
	};
}
