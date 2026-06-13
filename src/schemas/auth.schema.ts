import Joi from "joi";
import { Role } from "../models/user.model";

export const signUpSchema = Joi.object({
  login: Joi.string().min(2).max(100).normalize().required(),
  email: Joi.string().email().normalize().required(),
  password: Joi.string().min(6).max(20).normalize().required(),
  role: Joi.string().valid(Role.student, Role.lecturer).required(),
  firstName: Joi.string().min(2).max(100).normalize().required(),
  lastName: Joi.string().min(2).max(100).normalize().required(),
  middleName: Joi.string().min(2).max(100).normalize().required(),
});

export const signInSchema = Joi.object({
  login: Joi.string().normalize().required(),
  password: Joi.string().normalize().required(),
});
