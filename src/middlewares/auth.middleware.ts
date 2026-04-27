import { NextFunction, Request, Response } from "express";
import passport from "passport";
import { Attributes } from "sequelize";
import { UnauthorizedError } from "../errors/app-error";
import { User } from "../models/user.model";

export const authenticateLocal = passport.authenticate("local", {
	session: false,
});
export const authenticateJwt = (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	passport.authenticate(
		"jwt",
		{ session: false },
		(error: Error | null, user: Attributes<User> | false) => {
			if (error) {
				return next(error);
			}
			if (!user) {
				return next(new UnauthorizedError("Требуется авторизация"));
			}
			req.user = user;
			next();
		},
	)(req, res, next);
};
