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
			res.json({ user: updatedUser });
		} catch (error: any) {
			res.status(400).json({
				message: "Ошибка изменения данных пользователя",
				error: error.message,
			});
		}
  };
}
