import crypto from "crypto";
import dayjs from "dayjs";
import { PasswordResetRepository } from "../repositories/passwordReset";
import { UserRepository } from "../repositories/user";
import { EmailService } from "./email";

export class PasswordResetService {
	private passwordResetRepository: PasswordResetRepository;
	private userRepository: UserRepository;
	private emailService: EmailService;

	constructor() {
		this.passwordResetRepository = new PasswordResetRepository();
		this.userRepository = new UserRepository();
		this.emailService = new EmailService();
	}

	private generateCode = () => {
		return crypto.randomInt(100000, 999999).toString();
	};

	requestPasswordReset = async (email: string) => {
		const user = await this.userRepository.findByEmail(email);

		if (!user) {
			throw new Error("Некорректный email");
		}

		await this.passwordResetRepository.deleteUserCodes(user.id);

		const code = this.generateCode();
		const expiresAt = dayjs().add(10, "minutes").toDate();

		await this.passwordResetRepository.create(user.id, code, expiresAt);

		try {
			await this.emailService.sendPasswordResetCode(user.email, code);
		} catch (error) {
			throw error;
		}

		return {
			success: true,
			message: "Код подтверждения отправлен на указанный email",
		};
	};

	verifyCode = async ({ code, email }: { code: string; email: string }) => {
		const user = await this.userRepository.findByEmail(email);

		if (!user) {
			throw new Error("Пользователь не найден");
		}

		const resetRecord = await this.passwordResetRepository.findValidCode(
			user.id,
			code,
		);

		if (!resetRecord) {
			throw new Error("Неверный код");
		} else if (resetRecord.isUsed) {
			throw new Error("Срок действия кода истёк");
		}

		return {
			success: true,
		};
	};

	resetPassword = async ({
		password,
		code,
		email,
	}: {
		password: string;
		code: string;
		email: string;
	}) => {
		const user = await this.userRepository.findByEmail(email);

		if (!user) {
			throw new Error("Пользователь не найден");
		}

		const resetRecord = await this.passwordResetRepository.findValidCode(
			user.id,
			code,
		);

		if (!resetRecord) {
			throw new Error("Неверный код");
		} else if (resetRecord.isUsed) {
			throw new Error("Срок действия кода истёк");
		}

		await this.passwordResetRepository.markAsUsed(resetRecord.id);

		return await this.userRepository.updatePassword(user.id, password);
	};

	deleteExpiredCodes = async () => {
		return await this.passwordResetRepository.deleteExpiredCodes();
	};
}
