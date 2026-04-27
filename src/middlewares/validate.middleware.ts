import { NextFunction, Request, Response } from "express";
import { ObjectSchema } from "joi";
import { FieldError, RequestValidationError } from "../errors/app-error";

type ValidationTarget = "body" | "query" | "params";

type ValidationSchemas = Partial<Record<ValidationTarget, ObjectSchema>>;

const validateSchema = (
	schema: ObjectSchema,
	data: unknown,
): { errors: FieldError[]; value?: unknown } => {
	const { error, value } = schema.validate(data, {
		abortEarly: false,
		stripUnknown: true,
		convert: true,
	});

	if (error) {
		return {
			errors: error.details.map((detail) => ({
				field: detail.path.join(""),
				message: detail.message.replace(/['"]/g, ""),
			})),
		};
	}

	return { errors: [], value };
};

export const validate = (schemas: ValidationSchemas) => {
	return (req: Request, res: Response, next: NextFunction) => {
		const allErrors: FieldError[] = [];

		if (schemas.body) {
			const { errors, value } = validateSchema(schemas.body, req.body);
			if (errors.length > 0) {
				allErrors.push(...errors);
			} else {
				req.body = value;
			}
		}

		if (schemas.query) {
			const { errors, value } = validateSchema(schemas.query, req.query);

			if (errors.length > 0) {
				allErrors.push(...errors);
			} else {
				req.validatedQuery = value as Record<string, unknown>;
			}
		}

		if (schemas.params) {
			const { errors, value } = validateSchema(schemas.params, req.params);

			if (errors.length > 0) {
				allErrors.push(...errors);
			} else {
				req.validatedParams = value as Record<string, unknown>;
			}
		}

		if (allErrors.length > 0) {
			return next(
				new RequestValidationError(
					"Некорректный формат данных запроса",
					allErrors,
				),
			);
		}

		next();
	};
};
