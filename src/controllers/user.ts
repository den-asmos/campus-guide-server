import { Request, Response } from "express";
import { UserService } from "../services/user";

export class UserController {
	private userService: UserService;

	constructor() {
		this.userService = new UserService();
	}

	getAllUsers = async (req: Request, res: Response) => {
		try {
			const users = await this.userService.getAllUsers();
			res.json(users);
		} catch (error: any) {
			res.status(500).json({
				message: "Ошибка получения данных о пользователях",
				error: error.message,
			});
		}
	};

	updateProfile = async (req: Request, res: Response) => {
		try {
			const updatedUser = await this.userService.updateProfile(
				req.user!.id,
				req.body,
			);
			res.status(200).json({ user: updatedUser });
		} catch (error: any) {
			res.status(500).json({
				message: "Ошибка изменения данных пользователя",
				error: error.message,
			});
		}
	};

	updateAvatar = async (req: Request, res: Response) => {
		try {
			if (!req.file) {
				res.status(400).json({
					message: "Отсутствует файл аватара",
				});
				return;
			}

			const response = await this.userService.updateAvatar(
				req.user!.id,
				req.file.buffer,
			);
			res.status(200).json(response);
		} catch (error: any) {
			res.status(500).json({
				message: "Ошибка изменения аватара",
				error: error.message,
			});
		}
	};

	deleteAvatar = async (req: Request, res: Response) => {
		try {
			const response = await this.userService.deleteAvatar(req.user!.id);
			res.status(200).json(response);
		} catch (error: any) {
			res.status(500).json({
				message: "Ошибка удаления аватара",
				error: error.message,
			});
		}
	};
}
