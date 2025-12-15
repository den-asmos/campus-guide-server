import Joi from "joi";

export const getClassroomSchema = Joi.object({
	title: Joi.string().required(),
});

export const getFloorClassroomsSchema = Joi.object({
	floor: Joi.number().min(1).max(7),
});
