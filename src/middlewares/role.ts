import { NextFunction, Request, Response } from "express";
import { Role } from "../models/User";

export const requireRole = (allowedRoles: Role[]) => {
	return (req: Request, res: Response, next: NextFunction) => {
		if (!req.user) {
			return res.status(401).json({
				message: "Ошибка авторизации",
			});
		}

		if (!allowedRoles.includes(req.user.role)) {
			return res.status(403).json({
				message: "Доступ запрещён",
			});
		}

		next();
	};
};
