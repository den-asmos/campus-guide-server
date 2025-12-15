import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import passport from "passport";
import { jwtConfig, JwtPayload } from "../config/jwt";
import { Faculty, Gender, Group, Role } from "../models/User";

export const authenticateLocal = passport.authenticate("local", {
	session: false,
});
export const authenticateJwt = passport.authenticate("jwt", { session: false });

export const requireAuth = () => {
	return (req: Request, res: Response, next: NextFunction) => {
		if (!req.user) {
			return res.status(401).json({ message: "Требуется авторизация" });
		}

		next();
	};
};

export const generateToken = (payload: JwtPayload): string => {
	return jwt.sign(payload, jwtConfig.secret, {
		expiresIn: jwtConfig.expiresIn,
		issuer: jwtConfig.issuer,
	});
};

declare global {
	namespace Express {
		interface User {
			id: number;
			login: string;
			email: string;
			role: Role;
			firstName: string;
			lastName: string;
			middleName: string;
			faculty: Faculty | null;
			course: number | null;
			group: Group | null;
			avatar: string | null;
			birthDate: Date | null;
			gender: Gender | null;
		}
	}
}
