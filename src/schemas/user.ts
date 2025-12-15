import Joi from "joi";
import { Faculty, Gender, Group, Role } from "../models/User";

export const signUpSchema = Joi.object({
	login: Joi.string().min(2).max(100).required(),
	email: Joi.string().email().required(),
	password: Joi.string().min(6).max(20).required(),
	role: Joi.string().valid(Role.student, Role.lecturer).required(),
	firstName: Joi.string().min(2).max(100).required(),
	lastName: Joi.string().min(2).max(100).required(),
	middleName: Joi.string().min(2).max(100).required(),
});

export const signInSchema = Joi.object({
	login: Joi.string().required(),
	password: Joi.string().required(),
});

export const updateProfileSchema = Joi.object({
	faculty: Joi.string()
		.valid(...Object.values(Faculty))
		.allow(null),
	course: Joi.number().integer().min(1).max(5).allow(null),
	group: Joi.string()
		.valid(...Object.values(Group))
		.allow(null),
	avatar: Joi.string().uri().allow(null),
	birthDate: Joi.date().max("now").allow(null),
	gender: Joi.string()
		.valid(...Object.values(Gender))
		.allow(null),
}).min(1);

export const updatePasswordSchema = Joi.object({
	password: Joi.string().min(6).max(20).required(),
});
