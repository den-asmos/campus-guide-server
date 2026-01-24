import dayjs from "dayjs";
import * as xlsx from "xlsx";

type JsonData = JsonDataItem[];
type JsonDataItem = (string | null)[];

export type DaySchedule = {
	date: string;
	dayName: string;
	groups: Group[];
};

export type Group = {
	course: number;
	specialty: string;
	groupName: string;
	subgroups: Subgroup[];
};

export type Subgroup = {
	subgroupName: string;
	lessons: Lesson[];
};

export type Lesson = {
	number: number;
	time: string;
	subject: string;
	type: LessonType;
	lecturer: string | null;
	classroom: string | null;
};

enum LessonType {
	lecture = "лк",
	offline = "off",
	laboratory = "лз",
	practical = "пз",
	control = "куср",
	credit = "зач",
	other = "другое",
}

type GroupInfo = {
	course: number;
	specialty: string;
	groupName: string;
	column: number;
	subgroupsInfo: Array<{ subgroupName: string; column: number }>;
};

export class TimetableParser {
	private readonly days = [
		"Понедельник",
		"Вторник",
		"Среда",
		"Четверг",
		"Пятница",
		"Суббота",
	];

	public parseTimetable(filePath: string): DaySchedule[] {
		const timetableData = this.parseXlsxToJson(filePath);
		const groupsInfo = this.extractGroupsInfo(timetableData);

		const result: DaySchedule[] = [];

		for (let dayIndex = 0; dayIndex < this.days.length; dayIndex++) {
			const daySchedule = this.parseDay(timetableData, dayIndex, groupsInfo);

			if (daySchedule.groups.length > 0) {
				result.push(daySchedule);
			}
		}

		return result;
	}

	private parseDay(
		data: JsonData,
		dayIndex: number,
		groupsInfo: GroupInfo[]
	): DaySchedule {
		const startDate = this.extractStartDate(data[8][0]);
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

			if (!data[lessonRowIndex + 1]) {
				continue;
			}

			if (lessonRowIndex >= data.length) {
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
				timeRange
			);

			this.distributeLessonsToGroups(daySchedule, groupsInfo, rowLessons);
		}

		return daySchedule;
	}

	private extractGroupsInfo(data: JsonData): GroupInfo[] {
		const groups: GroupInfo[] = [];

		const coursesRow = data[10];
		const specialtiesRow = data[11];
		const groupNamesRow = data[12];
		const subgroupNamesRow = data[13];

		for (let column = 3; column < specialtiesRow.length; column += 2) {
			const course = coursesRow[column];
			const specialty = specialtiesRow[column];
			const groupName = groupNamesRow[column];

			if (
				specialty &&
				groupName &&
				typeof course === "string" &&
				parseInt(course[0]) &&
				typeof specialty === "string" &&
				typeof groupName === "string" &&
				specialty.trim() &&
				groupName.trim()
			) {
				groups.push({
					course: parseInt(course[0]),
					specialty: specialty.trim(),
					groupName: groupName.trim(),
					column,
					subgroupsInfo: this.findSubgroups(
						column,
						subgroupNamesRow,
						groupName.trim()
					),
				});
			}
		}

		return groups;
	}

	private findSubgroups(
		mainColumn: number,
		subgroupsRow: JsonDataItem,
		mainGroupName: string
	): Array<{ subgroupName: string; column: number }> {
		const subgroups: Array<{ subgroupName: string; column: number }> = [];

		let column = 3;
		while (column < subgroupsRow.length) {
			const subgroupName = subgroupsRow[column];

			if (
				subgroupName &&
				typeof subgroupName === "string" &&
				subgroupName.includes(mainGroupName)
			) {
				subgroups.push({ subgroupName, column });
				column++;
			} else {
				column++;
			}
		}

		return subgroups;
	}

	private distributeLessonsToGroups(
		daySchedule: DaySchedule,
		groupsInfo: GroupInfo[],
		rowLessons: Array<{ column: number; lesson: Lesson }>
	): void {
		for (const groupInfo of groupsInfo) {
			let group = daySchedule.groups.find(
				(item) =>
					item.course === groupInfo.course &&
					item.specialty === groupInfo.specialty &&
					item.groupName === groupInfo.groupName
			);

			if (!group) {
				group = {
					course: groupInfo.course,
					specialty: groupInfo.specialty,
					groupName: groupInfo.groupName,
					subgroups: [],
				};
				daySchedule.groups.push(group);
			}

			for (const subgroupInfo of groupInfo.subgroupsInfo) {
				let subgroup = group.subgroups.find(
					(item) => item.subgroupName === subgroupInfo.subgroupName
				);

				if (!subgroup) {
					subgroup = {
						subgroupName: subgroupInfo.subgroupName,
						lessons: [],
					};

					group.subgroups.push(subgroup);
				}

				const subgroupLesson = rowLessons.find(
					(lesson) => lesson.column === subgroupInfo.column
				);

				if (subgroupLesson) {
					subgroup.lessons.push(subgroupLesson.lesson);
				}
			}
		}
	}

	private parseRowLessons(
		data: JsonData,
		lessonRowIndex: number,
		lessonNumber: number,
		timeRange: string
	): Array<{ column: number; lesson: Lesson }> {
		const lessons: Array<{ column: number; lesson: Lesson }> = [];

		for (let column = 3; column < data[lessonRowIndex].length; column++) {
			const lesson = this.parseLesson(
				data,
				lessonRowIndex,
				column,
				lessonNumber,
				timeRange
			);

			if (lesson) {
				lessons.push({ column, lesson });
			}
		}

		return lessons;
	}

	private parseLesson(
		data: JsonData,
		lessonRowIndex: number,
		column: number,
		lessonNumber: number,
		timeRange: string
	): Lesson | null {
		const subjectCell = data[lessonRowIndex]?.[column];
		const lecturerCell = data[lessonRowIndex + 1]?.[column];
		const classroomCell = data[lessonRowIndex + 2]?.[column];

		if (
			!subjectCell ||
			typeof subjectCell !== "string" ||
			!subjectCell.trim()
		) {
			return null;
		}

		let type: LessonType = LessonType.other;

		if (subjectCell.toLowerCase().includes("(лек)")) {
			type = LessonType.lecture;
		} else if (subjectCell.toLowerCase().includes("(лек (off))")) {
			type = LessonType.offline;
		} else if (subjectCell.toLowerCase().includes("(лаб)")) {
			type = LessonType.laboratory;
		} else if (subjectCell.toLowerCase().includes("(куср)")) {
			type = LessonType.control;
		} else if (subjectCell.toLowerCase().includes("(зач)")) {
			type = LessonType.credit;
		} else if (subjectCell.toLowerCase().includes("(пз)")) {
			type = LessonType.practical;
		}

		let classroom: string | null = null;

		if (classroomCell && typeof classroomCell === "string") {
			const classroomMatch = classroomCell.match(/ауд\.\s*(.+)/);

			if (classroomMatch) {
				classroom = classroomMatch[1];
			} else {
				classroom = classroomCell.toLowerCase();
			}
		}

		const subject = subjectCell.split("(")[0].trim();
		const lecturer =
			lecturerCell && typeof lecturerCell === "string"
				? lecturerCell.trim()
				: null;

		return {
			number: lessonNumber,
			time: timeRange,
			subject,
			type,
			lecturer,
			classroom,
		};
	}

	parseXlsxToJson(filePath: string): JsonData {
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

	extractStartDate = (rowWithDate: string | null): string => {
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
}
