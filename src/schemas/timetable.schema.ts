import Joi from "joi";
import { Faculty, Group } from "../models/user.model";

export const getGroupTimetableSchema = Joi.object({
  faculty: Joi.string().valid(...Object.values(Faculty)),
  course: Joi.number().integer().min(1).max(5),
  group: Joi.string().valid(...Object.values(Group)),
});

export const getLecturerTimetableSchema = Joi.object({
  firstName: Joi.string().min(2).max(100).normalize().required(),
  lastName: Joi.string().min(2).max(100).normalize().required(),
  middleName: Joi.string().min(2).max(100).normalize().required(),
});

export const getClassroomTimetableSchema = Joi.object({
  classroom: Joi.string().normalize().required(),
});
