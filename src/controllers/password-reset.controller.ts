import { NextFunction, Request, Response } from "express";
import { PasswordResetService } from "../services/password-reset.service";

export class PasswordResetController {
	constructor(private passwordResetService: PasswordResetService) {}

	requestReset = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const result = await this.passwordResetService.requestPasswordReset(
				req.body.email,
			);
			res.json(result);
		} catch (error) {
			next(error);
		}
	};

	verifyCode = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const result = await this.passwordResetService.verifyCode(req.body);
			res.json(result);
		} catch (error) {
			next(error);
		}
	};

	resetPassword = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const result = await this.passwordResetService.resetPassword(req.body);
			res.json(result);
		} catch (error) {
			next(error);
		}
	};
}
