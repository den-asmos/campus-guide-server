import Joi from "joi";
import { Role } from "../models/user.model";

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
