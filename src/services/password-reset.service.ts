import crypto from "crypto";
import dayjs from "dayjs";
import { AppError, NotFoundError } from "../errors/app-error";
import { PasswordReset } from "../models/password-reset.model";
import { User } from "../models/user.model";
import { PasswordResetRepository } from "../repositories/password-reset.repository";
import { UserRepository } from "../repositories/user.repository";
import { MessageResponse } from "../types/response.types";
import { EmailService } from "./email.service";

interface VerifyCodeDto {
	code: string;
	email: string;
}

interface ResetPasswordDto {
	email: string;
	code: string;
	password: string;
}

const RESET_CODE_TTL_MINUTES = 10;
const RESET_CODE_RANGE = { min: 100_000, max: 999_999 };

export class PasswordResetService {
	constructor(
		private passwordResetRepository: PasswordResetRepository,
		private userRepository: UserRepository,
		private emailService: EmailService,
	) {}

	private generateCode(): string {
		return crypto
			.randomInt(RESET_CODE_RANGE.min, RESET_CODE_RANGE.max)
			.toString();
	}

	private async findUserAndValidCode(
		email: string,
		code: string,
	): Promise<{
		user: User;
		resetRecord: PasswordReset;
	}> {
		const user = await this.userRepository.findByEmail(email);
		if (!user) {
			throw new NotFoundError("Пользователь не найден");
		}

		const resetRecord = await this.passwordResetRepository.findValidCode(
			user.id,
			code,
		);
		if (!resetRecord) {
			throw new AppError(
				"Неверный код или истёк его срок действия",
				400,
				"INVALID_CODE",
			);
		}

		return { user, resetRecord };
	}

	async requestPasswordReset(email: string): Promise<MessageResponse> {
		const user = await this.userRepository.findByEmail(email);

		if (!user) {
			return { message: "Код подтверждения был отправлен на указанный email" };
		}

		await this.passwordResetRepository.deleteUserCodes(user.id);

		const code = this.generateCode();
		const expiresAt = dayjs().add(RESET_CODE_TTL_MINUTES, "minutes").toDate();

		await this.passwordResetRepository.create({
			userId: user.id,
			code,
			expiresAt,
			isUsed: false,
		});
		await this.emailService.sendPasswordResetCode(user.email, code);

		return { message: "Код подтверждения был отправлен на указанный email" };
	}

	async verifyCode(dto: VerifyCodeDto): Promise<MessageResponse> {
		await this.findUserAndValidCode(dto.email, dto.code);
		return { message: "Код верный" };
	}

	async resetPassword(dto: ResetPasswordDto): Promise<MessageResponse> {
		const { user, resetRecord } = await this.findUserAndValidCode(
			dto.email,
			dto.code,
		);

		await this.passwordResetRepository.markAsUsed(resetRecord.id);
		await this.userRepository.updatePassword(user.id, dto.password);

		return { message: "Пароль сброшен" };
	}

	async deleteExpiredCodes(): Promise<void> {
		await this.passwordResetRepository.deleteExpiredCodes();
	}
}
