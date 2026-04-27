import { NextFunction, Request, Response } from "express";
import { AppError, UnauthorizedError } from "../errors/app-error";
import { UserService } from "../services/user.service";

export class UserController {
	constructor(private userService: UserService) {}

	getAll = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const users = await this.userService.getAllUsers();
			res.json(users);
		} catch (error) {
			next(error);
		}
	};

	updateProfile = async (req: Request, res: Response, next: NextFunction) => {
		try {
			if (!req.user) {
				return next(new UnauthorizedError("Требуется авторизация"));
			}
			const user = await this.userService.updateProfile(req.user.id, req.body);
			res.json(user);
		} catch (error) {
			next(error);
		}
	};

	updateAvatar = async (req: Request, res: Response, next: NextFunction) => {
		try {
			if (!req.user) {
				return next(new UnauthorizedError("Требуется авторизация"));
			}
			if (!req.file) {
				return next(new AppError("Отсутствует файл аватара", 400, "NO_FILE"));
			}

			const result = await this.userService.updateAvatar(
				req.user.id,
				req.file.buffer,
			);
			res.json(result);
		} catch (error) {
			next(error);
		}
	};

	deleteAvatar = async (req: Request, res: Response, next: NextFunction) => {
		try {
			if (!req.user) {
				return next(new UnauthorizedError("Требуется авторизация"));
			}
			await this.userService.deleteAvatar(req.user.id);
			res.status(204).send();
		} catch (error) {
			next(error);
		}
	};
}
