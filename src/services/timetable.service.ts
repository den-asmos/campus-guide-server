import dotenv from "dotenv";
import { NotFoundError } from "../errors/app-error";
import { Faculty } from "../models/user.model";
import {
	DaySchedule,
	GroupDaySchedule,
	GroupTimetableDto,
	LecturerTimetableDto,
	TimetableDownload,
} from "../types/timetable.types";
import { TimetableDownloader } from "../utils/timetable/timetable-downloader";
import { TimetableFilter } from "../utils/timetable/timetable-filter";
import { TimetableParser } from "../utils/timetable/timetable-parser";
import { TimetableScheduler } from "../utils/timetable/timetable-scheduler";

dotenv.config();

export class TimetableService {
	constructor(
		private downloader: TimetableDownloader,
		private filter: TimetableFilter,
		private parser: TimetableParser,
		private scheduler: TimetableScheduler,
	) {
		this.scheduler.start();
	}

	async getGroupTimetable(dto: GroupTimetableDto): Promise<GroupDaySchedule[]> {
		const downloads = await this.downloader.download(dto.faculty);
		const days = this.parseTimetableFiles(downloads);

		return days.map(({ date, dayName, groups }) => {
			const group = groups.find(
				(g) => g.course === dto.course && g.groupName === dto.group,
			);

			if (!group) {
				throw new NotFoundError("Группа не найдена");
			}

			return { date, dayName, group };
		});
	}

	async getLecturerTimetable(
		dto: LecturerTimetableDto,
	): Promise<DaySchedule[]> {
		const lecturer = this.formatLecturerName(dto);
		const days = await this.fetchAndMergeAllFaculties();

		return days.map((day) => ({
			...day,
			groups: this.filter.filterLecturerGroups(day.groups, lecturer),
		}));
	}

	async getClassroomTimetable(classroom: string): Promise<DaySchedule[]> {
		const days = await this.fetchAndMergeAllFaculties();

		return days.map((day) => ({
			...day,
			groups: this.filter.filterClassroomGroups(
				day.groups,
				classroom.toLowerCase(),
			),
		}));
	}

	private async fetchAndMergeAllFaculties(): Promise<DaySchedule[]> {
		const allDays = await Promise.all(
			Object.values(Faculty).map(async (faculty) => {
				const downloads = await this.downloader.download(faculty);
				return this.parseTimetableFiles(downloads);
			}),
		);

		return this.mergeTimetableDays(allDays.flat());
	}

	private parseTimetableFiles(downloads: TimetableDownload): DaySchedule[] {
		const days = downloads.filePaths.flatMap((fp) =>
			this.parser.parseTimetable(fp),
		);
		return downloads.multiple ? this.mergeTimetableDays(days) : days;
	}

	private mergeTimetableDays(days: DaySchedule[]): DaySchedule[] {
		return days.reduce<DaySchedule[]>((acc, day) => {
			const existing = acc.find((d) => d.date === day.date);
			if (existing) {
				existing.groups.push(...day.groups);
			} else {
				acc.push({ ...day });
			}
			return acc;
		}, []);
	}

	private formatLecturerName({
		firstName,
		lastName,
		middleName,
	}: LecturerTimetableDto): string {
		return `${lastName} ${firstName.charAt(0)}. ${middleName.charAt(0)}.`;
	}
}
