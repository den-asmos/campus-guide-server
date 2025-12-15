import Joi from "joi";
import { Faculty, Group } from "../models/User";

export const getGroupTimetableSchema = Joi.object({
	faculty: Joi.string().valid(...Object.values(Faculty)),
	course: Joi.number().integer().min(1).max(5),
	group: Joi.string().valid(...Object.values(Group)),
});

export const getClassroomTimetableSchema = Joi.object({
	classroom: Joi.string().required(),
});
