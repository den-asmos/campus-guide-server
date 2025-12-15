import { Request, Response } from "express";
import { AuthService } from "../services/auth";
import { UserService } from "../services/user";

export class AuthController {
	private authService: AuthService;
	private userService: UserService;

	constructor() {
		this.authService = new AuthService();
		this.userService = new UserService();
	}

	signUp = async (req: Request, res: Response) => {
		try {
			const result = await this.authService.signUp(req.body);
			res.status(201).json(result);
		} catch (error: any) {
			res.status(400).json({
				message: "Ошибка регистрации",
				error: error.message,
			});
		}
	};

	signIn = async (req: Request, res: Response) => {
		try {
			const result = await this.authService.signIn(req.body);
			res.json(result);
		} catch (error: any) {
			res.status(401).json({
				message: "Ошибка авторизации",
				error: error.message,
			});
		}
	};

	getCurrentUser = async (req: Request, res: Response) => {
		try {
			const user = await this.authService.getCurrentUser(req.user!.id);
			res.json(user);
		} catch (error: any) {
			res.status(404).json({
				message: "Пользователь не найден",
				error: error.message,
			});
		}
	};

	updateProfile = async (req: Request, res: Response) => {
		try {
			const updatedUser = await this.userService.updateProfile(
				req.user!.id,
				req.body
			);
			res.json({ user: updatedUser });
		} catch (error: any) {
			res.status(400).json({
				message: "Ошибка изменения данных пользователя",
				error: error.message,
			});
		}
	};

	updatePassword = async (req: Request, res: Response) => {
		try {
			// TODO: Add code confirmation logic

			const result = await this.userService.updatePassword(
				req.user!.id,
				req.body
			);
			res.json(result);
		} catch (error: any) {
			res.status(400).json({
				message: "Ошибка изменения пароля",
				error: error.message,
			});
		}
	};

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
}
