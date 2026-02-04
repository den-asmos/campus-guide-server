import Joi from "joi";
import { Faculty, Gender, Group } from "../models/User";

export const updateProfileSchema = Joi.object({
	faculty: Joi.string()
		.valid(...Object.values(Faculty))
		.allow(null),
	course: Joi.number().integer().min(1).max(5).allow(null),
	group: Joi.string()
		.valid(...Object.values(Group))
		.allow(null),
	birthDate: Joi.date().max("now").allow(null),
	gender: Joi.string()
		.valid(...Object.values(Gender))
		.allow(null),
}).min(1);

export const requestPasswordResetSchema = Joi.object({
	email: Joi.string().email().required(),
});

export const verifyPasswordResetSchema = Joi.object({
	code: Joi.string().min(6).max(6).required(),
	email: Joi.string().email().required(),
});

export const resetPasswordSchema = Joi.object({
	password: Joi.string().min(6).max(20).required(),
	code: Joi.string().min(6).max(6).required(),
	email: Joi.string().email().required(),
});
