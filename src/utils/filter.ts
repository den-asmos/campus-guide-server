import { Group, Lesson, Subgroup } from "./timetableParser";

const hasLectureLessons = (lessons: Lesson[], lecturer: string) => {
	return lessons.some((lesson) => lesson.lecturer === lecturer);
};

const filterLecturerSubgroups = (subgroups: Subgroup[], lecturer: string) => {
	return subgroups
		.filter((subgroup) => hasLectureLessons(subgroup.lessons, lecturer))
		.map((subgroup) => ({
			...subgroup,
			lessons: subgroup.lessons.filter(
				(lesson) => lesson.lecturer === lecturer
			),
		}));
};

export const filterLecturerGroups = (groups: Group[], lecturer: string) => {
	return groups
		.filter((group) =>
			group.subgroups.some((subgroup) =>
				hasLectureLessons(subgroup.lessons, lecturer)
			)
		)
		.map((group) => ({
			...group,
			subgroups: filterLecturerSubgroups(group.subgroups, lecturer),
		}));
};

const hasClassroomLessons = (lessons: Lesson[], classroom: string) => {
	return lessons.some((lesson) =>
		lesson.classroom?.toLowerCase().includes(classroom)
	);
};

const filterClassroomSubgroups = (subgroups: Subgroup[], classroom: string) => {
	return subgroups
		.filter((subgroup) => hasClassroomLessons(subgroup.lessons, classroom))
		.map((subgroup) => ({
			...subgroup,
			lessons: subgroup.lessons.filter((lesson) =>
				lesson.classroom?.toLowerCase().includes(classroom)
			),
		}));
};

export const filterClassroomGroups = (groups: Group[], classroom: string) => {
	return groups
		.filter((group) =>
			group.subgroups.some((subgroup) =>
				hasClassroomLessons(subgroup.lessons, classroom)
			)
		)
		.map((group) => ({
			...group,
			subgroups: filterClassroomSubgroups(group.subgroups, classroom),
		}));
};
