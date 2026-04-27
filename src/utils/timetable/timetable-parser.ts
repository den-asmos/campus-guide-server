import dayjs from "dayjs";
import * as xlsx from "xlsx";
import {
	DaySchedule,
	Lesson,
	LessonType,
	TimetableGroup,
} from "../../types/timetable.types";

type JsonData = JsonDataItem[];
type JsonDataItem = (string | null)[];

interface TimetableGroupInfo {
	course: number;
	specialty: string;
	groupName: string;
	column: number;
	subgroupsInfo: Array<{ subgroupName: string; column: number }>;
}

export class TimetableParser {
	private readonly days = [
		"Понедельник",
		"Вторник",
		"Среда",
		"Четверг",
		"Пятница",
		"Суббота",
	];
	private readonly lessonTypeMap: Array<[RegExp, LessonType]> = [
		[/\(лек \(off\)\)/i, LessonType.offline],
		[/\(лек\)/i, LessonType.lecture],
		[/\(лаб\)/i, LessonType.laboratory],
		[/\(пз\)/i, LessonType.practical],
		[/\(куср\)/i, LessonType.control],
		[/\(зач\)/i, LessonType.credit],
		[/\(экз\)/i, LessonType.exam],
		[/\(конс\)/i, LessonType.consultation],
	];

	parseTimetable(filePath: string): DaySchedule[] {
		const data = this.parseXlsxToJson(filePath);
		const groupsInfo = this.extractGroupsInfo(data);

		const startDate = this.extractStartDate(data[8]?.[0]);

		return this.days
			.map((_, index) => this.parseDay(data, index, groupsInfo, startDate))
			.filter((d) => d.groups.length > 0);
	}

	private parseDay(
		data: JsonData,
		dayIndex: number,
		groupsInfo: TimetableGroupInfo[],
		startDate: string,
	): DaySchedule {
		const date = dayjs(startDate)
			.locale("ru")
			.add(dayIndex, "day")
			.format("DD.MM.YYYY");
		const dayName = this.days[dayIndex];

		const daySchedule: DaySchedule = {
			date,
			dayName,
			groups: [],
		};

		const dayRowIndex = this.findDayRow(data, dayName);

		if (dayRowIndex === -1) {
			return daySchedule;
		}

		for (let lessonNumber = 1; lessonNumber <= 8; lessonNumber++) {
			const lessonRowIndex = dayRowIndex + (lessonNumber - 1) * 3;

			if (lessonRowIndex >= data.length || !data[lessonRowIndex + 1]) {
				continue;
			}

			const timeCell = data[lessonRowIndex + 1][2];
			if (!this.isValidTimeSlot(timeCell)) {
				continue;
			}

			const timeRange = this.extractTimeRange(timeCell);
			const rowLessons = this.parseRowLessons(
				data,
				lessonRowIndex,
				lessonNumber,
				timeRange,
			);
			this.distributeLessonsToGroups(daySchedule, groupsInfo, rowLessons);
		}

		return daySchedule;
	}

	private extractGroupsInfo(data: JsonData): TimetableGroupInfo[] {
		const groups = new Map<string, TimetableGroupInfo>();

		const coursesRow = data[10];
		const specialtiesRow = data[11];
		const groupNamesRow = data[12];
		const subgroupNamesRow = data[13];

		for (let column = 3; column < specialtiesRow.length; column++) {
			const course = coursesRow[column];
			const specialty = specialtiesRow[column]?.trim();
			const groupName = groupNamesRow[column]?.trim();

			if (
				typeof course === "string" &&
				typeof specialty === "string" &&
				typeof groupName === "string" &&
				parseInt(course[0]) &&
				specialty &&
				groupName &&
				!groups.has(groupName)
			) {
				groups.set(groupName, {
					course: parseInt(course[0]),
					specialty,
					groupName,
					column,
					subgroupsInfo: this.findSubgroups(subgroupNamesRow, groupName),
				});
			}
		}

		return Array.from(groups.values());
	}

	private findSubgroups(
		row: JsonDataItem,
		groupName: string,
	): Array<{ subgroupName: string; column: number }> {
		const result: Array<{ subgroupName: string; column: number }> = [];

		for (let column = 3; column < row.length; column++) {
			const subgroupName = row[column];
			if (
				typeof subgroupName === "string" &&
				subgroupName.includes(groupName)
			) {
				result.push({ subgroupName, column });
			}
		}

		return result;
	}

	private distributeLessonsToGroups(
		daySchedule: DaySchedule,
		groupsInfo: TimetableGroupInfo[],
		rowLessons: Array<{ column: number; lesson: Lesson }>,
	) {
		const groupMap = new Map<string, TimetableGroup>(
			daySchedule.groups.map((g) => [
				`${g.course}-${g.specialty}-${g.groupName}`,
				g,
			]),
		);

		const lessonsMap = new Map<number, Lesson>();
		for (const { column, lesson } of rowLessons) {
			lessonsMap.set(column, lesson);
		}

		for (const groupInfo of groupsInfo) {
			const key = `${groupInfo.course}-${groupInfo.specialty}-${groupInfo.groupName}`;
			let group = groupMap.get(key);

			if (!group) {
				group = {
					course: groupInfo.course,
					specialty: groupInfo.specialty,
					groupName: groupInfo.groupName,
					subgroups: [],
				};

				groupMap.set(key, group);
				daySchedule.groups.push(group);
			}

			for (const subgroupInfo of groupInfo.subgroupsInfo) {
				let subgroup = group.subgroups.find(
					(s) => s.subgroupName === subgroupInfo.subgroupName,
				);

				if (!subgroup) {
					subgroup = {
						subgroupName: subgroupInfo.subgroupName,
						lessons: [],
					};

					group.subgroups.push(subgroup);
				}

				const lesson = lessonsMap.get(subgroupInfo.column);
				if (lesson) {
					subgroup.lessons.push(lesson);
				}
			}
		}
	}

	private parseRowLessons(
		data: JsonData,
		lessonRowIndex: number,
		lessonNumber: number,
		timeRange: string,
	): Array<{ column: number; lesson: Lesson }> {
		const lessons: Array<{ column: number; lesson: Lesson }> = [];
		const row = data[lessonRowIndex];

		for (let column = 3; column < row.length; column++) {
			const lesson = this.parseLesson(
				data,
				lessonRowIndex,
				column,
				lessonNumber,
				timeRange,
			);

			if (lesson) {
				lessons.push({ column, lesson });
			}
		}

		return lessons;
	}

	private parseLesson(
		data: JsonData,
		row: number,
		column: number,
		lessonNumber: number,
		time: string,
	): Lesson | null {
		const subjectCell = data[row]?.[column]?.trim();
		if (typeof subjectCell !== "string" || !subjectCell) {
			return null;
		}

		const lecturerCell = data[row + 1]?.[column];
		const classroomCell = data[row + 2]?.[column];

		const subject = subjectCell.split("(")[0];
		const type = this.getLessonType(subjectCell);

		return {
			number: lessonNumber,
			time,
			subject,
			type,
			lecturer: typeof lecturerCell === "string" ? lecturerCell.trim() : null,
			classroom: this.parseClassroom(classroomCell),
		};
	}

	private parseXlsxToJson(filePath: string): JsonData {
		const workbook = xlsx.readFile(filePath);
		const sheetName = workbook.SheetNames[0];
		const worksheet = workbook.Sheets[sheetName];

		const merges = worksheet["!merges"] || [];

		const data: JsonData = xlsx.utils.sheet_to_json(worksheet, {
			header: 1,
			defval: null,
		});

		return this.mergeCells(data, merges);
	}

	private mergeCells(data: JsonData, merges: xlsx.Range[]): JsonData {
		for (const merge of merges) {
			const { s: firstCellInRange, e: lastCellInRange } = merge;
			const value = data[firstCellInRange.r]?.[firstCellInRange.c];

			for (let row = firstCellInRange.r; row <= lastCellInRange.r; row++) {
				for (
					let column = firstCellInRange.c;
					column <= lastCellInRange.c;
					column++
				) {
					if (!data[row]) {
						data[row] = [];
					}

					data[row][column] = value;
				}
			}
		}

		return data;
	}

	private extractStartDate = (rowWithDate: string | null): string => {
		if (!rowWithDate) {
			return "";
		}

		const range = rowWithDate.match(/\((.*?)\)/);

		if (!range) {
			return "";
		}

		const [day, month, year] = range[1].split("-")[0].trim().split(".");
		return `${year}.${month}.${day}`;
	};

	private isValidTimeSlot(timeCell: string | null): boolean {
		return (
			typeof timeCell === "string" &&
			/\(\d{2}:\d{2}-\d{2}:\d{2}\)/.test(timeCell)
		);
	}

	private extractTimeRange(timeCell: string | null): string {
		if (!timeCell) {
			return "";
		}

		const match = timeCell.match(/\((\d{2}:\d{2}-\d{2}:\d{2})\)/);
		return match ? match[1] : "";
	}

	private findDayRow(data: JsonData, dayName: string): number {
		for (let row = 0; row < data.length; row++) {
			const cell = data[row][0];

			if (cell && typeof cell === "string" && cell.includes(dayName)) {
				return row;
			}
		}

		return -1;
	}

	private getLessonType(subject: string): LessonType {
		for (const [regex, type] of this.lessonTypeMap) {
			if (regex.test(subject)) {
				return type;
			}
		}
		return LessonType.other;
	}

	private parseClassroom(value: unknown): string | null {
		if (typeof value !== "string") {
			return null;
		}

		if (value.includes("Технопарк")) {
			return "Технопарк";
		}
		if (value.includes("Планетарий")) {
			return "702";
		}
		if (value.includes("Актовый")) {
			return "153";
		}
		if (value.includes("большой")) {
			return "145";
		}
		if (value.includes("малый")) {
			return "146";
		}

		const match = value.match(/ауд\.\s*(.+)/i);
		if (match) {
			return match[1].toUpperCase();
		}

		return value.toLowerCase();
	}
}
