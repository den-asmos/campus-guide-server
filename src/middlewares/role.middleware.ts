import { NextFunction, Request, Response } from "express";
import { AppError, UnauthorizedError } from "../errors/app-error";
import { Role } from "../models/user.model";

export const requireRole = (allowedRoles: Role[]) => {
	return (req: Request, res: Response, next: NextFunction) => {
		if (!req.user) {
			return next(new UnauthorizedError("Требуется авторизация"));
		}

		if (!allowedRoles.includes(req.user.role)) {
			return next(new AppError("Доступ запрещён", 403, "FORBIDDEN"));
		}

		next();
	};
};
