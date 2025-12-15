import { UserAttributes } from "../models/User";
import { UserRepository } from "../repositories/user";

export class UserService {
	private userRepository: UserRepository;

	constructor() {
		this.userRepository = new UserRepository();
	}

	updateProfile = async (
		userId: number,
		newData: Partial<
			Omit<
				UserAttributes,
				"id" | "login" | "email" | "password" | "firstName" | "lastName"
			>
		>
	) => {
		const user = await this.userRepository.update(userId, newData);
		return user.toSafeObject();
	};

	updatePassword = async (userId: number, newPassword: string) => {
		const user = await this.userRepository.findById(userId);

		if (!user) {
			throw new Error("Пользователь не найден");
		}

		await user.update({ password: newPassword });

		return { message: "Пароль изменён" };
	};

	getAllUsers = async () => {
		return this.userRepository.findAll();
	};

	getUserById = async (userId: number) => {
		const user = await this.userRepository.findById(userId);

		if (!user) {
			throw new Error("Пользователь не найден");
		}

		return user.toSafeObject();
	};
}
