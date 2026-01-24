import Joi from "joi";

export const getDirectionSchema = Joi.object({
	origin: Joi.string().min(1).max(20),
	destination: Joi.string().min(1).max(20),
});
