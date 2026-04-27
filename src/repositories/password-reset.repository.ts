import { CreationAttributes, Op } from "sequelize";
import { PasswordReset } from "../models/password-reset.model";
import { BaseRepository } from "./base.repository";

export class PasswordResetRepository extends BaseRepository<PasswordReset> {
	constructor() {
		super(PasswordReset);
	}

	async findValidCode(id: number, code: string): Promise<PasswordReset | null> {
		return PasswordReset.findOne({
			where: {
				userId: id,
				code,
				isUsed: false,
				expiresAt: {
					[Op.gt]: new Date(),
				},
			},
		});
	}

	async markAsUsed(id: number): Promise<void> {
		await PasswordReset.update({ isUsed: true }, { where: { id } });
	}

	async create(
		data: CreationAttributes<PasswordReset>,
	): Promise<PasswordReset> {
		return PasswordReset.create(data);
	}

	async deleteExpiredCodes(): Promise<void> {
		await PasswordReset.destroy({
			where: {
				expiresAt: {
					[Op.lt]: new Date(),
				},
			},
		});
	}

	async deleteUserCodes(id: number): Promise<void> {
		await PasswordReset.destroy({ where: { userId: id } });
	}
}
