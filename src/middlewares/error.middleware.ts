import { NextFunction, Request, Response } from "express";
import { UniqueConstraintError, ValidationError } from "sequelize";
import { AppError, RequestValidationError } from "../errors/app-error";
import logger from "../utils/logger";

export const errorMiddleware = (
	error: Error,
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	if (error instanceof RequestValidationError) {
		return res.status(400).json({
			error: { code: error.code, message: error.message, fields: error.fields },
		});
	}

	if (error instanceof AppError) {
		return res.status(error.statusCode).json({
			error: { code: error.code, message: error.message },
		});
	}

	if (error instanceof UniqueConstraintError) {
		return res.status(409).json({
			error: { code: "CONFLICT", message: "Ресурс уже существует" },
		});
	}

	if (error instanceof ValidationError) {
		return res.status(400).json({
			error: {
				code: "VALIDATION_ERROR",
				message: `Ошибка валидации: ${error.message}`,
			},
		});
	}

	logger.error("[Unhandled Error]", error);
	return res.status(500).json({
		error: { code: "INTERNAL_ERROR", message: "Что-то пошло не так" },
	});
};
