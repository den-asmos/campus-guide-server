import {
	Lesson,
	TimetableGroup,
	TimetableSubgroup,
} from "../../types/timetable.types";

type LessonsPredicate = (lesson: Lesson) => boolean;

export class TimetableFilter {
	filterLecturerGroups(
		groups: TimetableGroup[],
		lecturer: string,
	): TimetableGroup[] {
		return this.filterGroups(groups, (lesson) => lesson.lecturer === lecturer);
	}

	filterClassroomGroups(
		groups: TimetableGroup[],
		classroom: string,
	): TimetableGroup[] {
		return this.filterGroups(
			groups,
			(lesson) => lesson.classroom?.toLowerCase().includes(classroom) ?? false,
		);
	}

	private filterGroups(
		groups: TimetableGroup[],
		predicate: LessonsPredicate,
	): TimetableGroup[] {
		return groups
			.filter((group) =>
				group.subgroups.some((subgroup) => subgroup.lessons.some(predicate)),
			)
			.map((group) => ({
				...group,
				subgroups: this.filterSubgroups(group.subgroups, predicate),
			}));
	}

	private filterSubgroups(
		subgroups: TimetableSubgroup[],
		predicate: LessonsPredicate,
	): TimetableSubgroup[] {
		return subgroups
			.filter((subgroup) => subgroup.lessons.some(predicate))
			.map((subgroup) => ({
				...subgroup,
				lessons: subgroup.lessons.filter(predicate),
			}));
	}
}
