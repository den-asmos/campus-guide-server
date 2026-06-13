import Joi from "joi";

export const getByTitleSchema = Joi.object({
  title: Joi.string().normalize().required(),
});

export const getAllByFloorSchema = Joi.object({
  floor: Joi.number().min(1).max(7).required(),
});

export const searchSchema = Joi.object({
  query: Joi.string().min(3).max(100).normalize().required(),
  limit: Joi.number().min(1).max(20),
});
