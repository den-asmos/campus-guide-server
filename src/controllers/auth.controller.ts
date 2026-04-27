import { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "../errors/app-error";
import { AuthService } from "../services/auth.service";

export class AuthController {
	constructor(private authService: AuthService) {}

	signUp = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const result = await this.authService.signUp(req.body);
			res.status(201).json(result);
		} catch (error) {
			next(error);
		}
	};

	signIn = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const result = await this.authService.signIn(req.body);
			res.json(result);
		} catch (error) {
			next(error);
		}
	};

	getCurrent = async (req: Request, res: Response, next: NextFunction) => {
		try {
			if (!req.user) {
				return next(new UnauthorizedError("Требуется авторизация"));
			}
			const user = await this.authService.getCurrentUser(req.user.id);
			res.json(user);
		} catch (error) {
			next(error);
		}
	};
}
