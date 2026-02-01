import { Request, Response } from "express";
import { AuthService } from "../services/auth";

export class AuthController {
	private authService: AuthService;

	constructor() {
		this.authService = new AuthService();
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
}
