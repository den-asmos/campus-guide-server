import { NextFunction, Request, Response } from "express";
import { ObjectSchema } from "joi";

type ValidationSchemas = {
	body?: ObjectSchema;
	query?: ObjectSchema;
};

declare global {
	namespace Express {
		interface Request {
			validatedQuery: any;
		}
	}
}

export const validate = (schemas: ValidationSchemas) => {
	return (req: Request, res: Response, next: NextFunction) => {
		const errors: Array<{ field: string; message: string; }> = [];

		if (schemas.body) {
			const { error, value } = schemas.body.validate(req.body, {
				abortEarly: false,
				stripUnknown: true,
			});

			if (error) {
				errors.push(
					...error.details.map((detail) => ({
						field: detail.path.join("."),
						message: detail.message,
					}))
				);
			} else {
				req.body = value;
			}
		}

		if (schemas.query) {
			const { error, value } = schemas.query.validate(req.query, {
				abortEarly: false,
				stripUnknown: true,
			});

			if (error) {
				errors.push(
					...error.details.map((detail) => ({
						field: detail.path.join("."),
						message: detail.message,
					}))
				);
			} else {
				req.validatedQuery = value;
			}
		}

		if (errors.length > 0) {
			return res.status(400).json({
				message: "Ошибка валидации, некорректный формат данных",
				errors,
			});
		}

		next();
	};
};
