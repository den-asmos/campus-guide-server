import { Request, Response } from "express";
import { PasswordResetService } from "../services/passwordReset";

export class PasswordResetController {
	private passwordResetService: PasswordResetService;

	constructor() {
		this.passwordResetService = new PasswordResetService();
	}

	requestReset = async (req: Request, res: Response) => {
		try {
			const result = await this.passwordResetService.requestPasswordReset(
				req.body.email,
			);
			res.status(201).json(result);
		} catch (error: any) {
			res.status(400).json({
				message: "Ошибка обработки запроса",
				error: error.message,
			});
		}
	};

	verifyCode = async (req: Request, res: Response) => {
		try {
			const result = await this.passwordResetService.verifyCode(req.body);
			res.status(200).json(result);
		} catch (error: any) {
			res.status(400).json({
				message: "Ошибка обработки запроса",
				error: error.message,
			});
		}
	};

	resetPassword = async (req: Request, res: Response) => {
		try {
			const result = await this.passwordResetService.resetPassword(req.body);
			res.status(200).json(result);
		} catch (error: any) {
			res.status(400).json({
				message: "Ошибка сброса пароля",
				error: error.message,
			});
		}
	};
}
