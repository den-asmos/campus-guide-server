import { Faculty, Group, User } from "../models/user.model";

export interface LinkInfo {
	href: string;
	filename: string;
	faculty: Faculty;
}

export interface TimetableDownload {
	filePaths: string[];
	multiple: boolean;
	faculty: Faculty;
}

export interface GroupTimetableDto {
	faculty: Faculty;
	course: number;
	group: Group;
}

export interface LecturerTimetableDto {
	firstName: User["firstName"];
	lastName: User["lastName"];
	middleName: User["middleName"];
}

export interface DaySchedule {
	date: string;
	dayName: string;
	groups: TimetableGroup[];
}

export interface TimetableGroup {
	course: number;
	specialty: string;
	groupName: string;
	subgroups: TimetableSubgroup[];
}

export interface TimetableSubgroup {
	subgroupName: string;
	lessons: Lesson[];
}

export interface Lesson {
	number: number;
	time: string;
	subject: string;
	type: LessonType;
	lecturer: string | null;
	classroom: string | null;
}

export enum LessonType {
	lecture = "лк",
	offline = "off",
	laboratory = "лз",
	practical = "пз",
	control = "куср",
	credit = "зач",
	exam = "экз",
	consultation = "конс",
	other = "другое",
}
