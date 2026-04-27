import { CreationAttributes } from "sequelize";
import { User } from "../models/user.model";
import { UpdateUser } from "../types/user.types";
import { BaseRepository } from "./base.repository";

export class UserRepository extends BaseRepository<User> {
	constructor() {
		super(User);
	}

	async findAll(): Promise<User[]> {
		return User.findAll({
			attributes: { exclude: ["password"] },
		});
	}

	async findByLogin(login: string): Promise<User | null> {
		return User.findOne({ where: { login } });
	}

	async findByEmail(email: string): Promise<User | null> {
		return User.findOne({ where: { email } });
	}

	async findAvatarUrl(id: number): Promise<string | null | undefined> {
		const user = await User.findByPk(id, { attributes: ["avatar"] });
		return user?.avatar;
	}

	async create(data: CreationAttributes<User>): Promise<User> {
		return User.create(data);
	}

	async update(id: number, data: UpdateUser): Promise<User | null> {
		const [, updated] = await User.update(data, {
			where: { id },
			returning: true,
		});
		return updated[0] ?? null;
	}

	async updatePassword(id: number, password: string): Promise<void> {
		await User.update({ password }, { where: { id } });
	}

	async deleteAvatar(id: number): Promise<void> {
		await User.update({ avatar: null }, { where: { id } });
	}
}
