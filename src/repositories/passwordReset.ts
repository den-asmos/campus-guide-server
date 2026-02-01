import { Op } from "sequelize";
import PasswordReset from "../models/PasswordReset";

export class PasswordResetRepository {
	async create(userId: number, code: string, expiresAt: Date) {
		return await PasswordReset.create({
			userId,
			code,
			expiresAt,
			isUsed: false,
		});
	}

	async findValidCode(userId: number, code: string) {
		return await PasswordReset.findOne({
			where: {
				userId,
				code,
				expiresAt: {
					[Op.gt]: new Date(),
				},
			},
		});
	}

	async markAsUsed(id: number) {
		const resetRecord = await PasswordReset.findByPk(id);

		if (!resetRecord) {
			throw new Error("Запрос не найден");
		}

		return await resetRecord.update({ isUsed: true });
	}

	async deleteExpiredCodes() {
		return await PasswordReset.destroy({
			where: {
				expiresAt: {
					[Op.lt]: new Date(),
				},
			},
		});
	}

	async deleteUserCodes(userId: number) {
		return await PasswordReset.destroy({ where: { userId } });
	}
}
