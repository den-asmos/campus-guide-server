import nodemailer, { Transporter } from "nodemailer";
import { emailConfig, getEmailOptions } from "../config/email.config";
import logger from "../utils/logger";
import { AppError } from "../errors/app-error";

export class EmailService {
	private transporter: Transporter;

	constructor(transporter?: Transporter) {
		this.transporter = transporter ?? nodemailer.createTransport(emailConfig);
	}

	async sendPasswordResetCode(email: string, code: string): Promise<void> {
		try {
			await this.transporter.sendMail(getEmailOptions(email, code));
			logger.info("[Email] Password reset code sent", { email });
		} catch (error) {
			logger.error("[Email] Failed to send password reset email", {
				email,
				error,
			});
			throw new AppError(
				"Ошибка при отправке письма",
				502,
				"EMAIL_SEND_FAILED",
			);
		}
	}
}
