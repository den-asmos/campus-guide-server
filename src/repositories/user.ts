import User, {
	UserCreateAttributes,
	UserUpdateAttributes
} from "../models/User";

export class UserRepository {
	async findById(id: number) {
		return await User.findByPk(id);
	}

	async findByLogin(login: string) {
		return await User.findOne({ where: { login } });
	}

	async findByEmail(email: string) {
		return await User.findOne({ where: { email } });
	}

	async create(userData: UserCreateAttributes) {
		return await User.create(userData);
	}

	async update(id: number, userData: Partial<UserUpdateAttributes>) {
		const user = await User.findByPk(id);

		if (!user) {
			throw new Error("Пользователь не найден");
		}

		return await user.update(userData);
	}

	async updatePassword(id: number, password: string) {
		const user = await User.findByPk(id);

		if (!user) {
			throw new Error("Пользователь не найден");
		}

		return await user.update({ password });
	}

	async findAll() {
		return await User.findAll({
			attributes: { exclude: ["password"] },
		});
	}

	async findAvatarUrl(id: number) {
		const user = await User.findByPk(id, { attributes: ["avatar"] });

		if (!user) {
			throw new Error("Пользователь не найден");
		}

		return user.avatar;
	}

	async deleteAvatar(id: number) {
		const user = await User.findByPk(id);

		if (!user) {
			throw new Error("Пользователь не найден");
		}

		return await user.update({ avatar: null });
	}
}
