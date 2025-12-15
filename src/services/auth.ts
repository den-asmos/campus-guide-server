import { generateToken } from "../middlewares/auth";
import { UserCreateAttributes } from "../models/User";
import { UserRepository } from "../repositories/user";

export class AuthService {
	private userRepository: UserRepository;

	constructor() {
		this.userRepository = new UserRepository();
	}

	signUp = async (userData: UserCreateAttributes) => {
		const existingUserByLogin = await this.userRepository.findByLogin(
			userData.login
		);
		const existingUserByEmail = await this.userRepository.findByEmail(
			userData.email
		);

		if (existingUserByLogin || existingUserByEmail) {
			throw new Error("Такой пользователь уже существует");
		}

		const user = await this.userRepository.create(userData);

		const token = generateToken({
			id: user.id,
			login: user.login,
			email: user.email,
			role: user.role,
		});

		return {
			message: "Регистрация выполнена",
			token,
		};
	};

	signIn = async ({ login, password }: { login: string; password: string }) => {
		const user = await this.userRepository.findByLogin(login);

		if (!user) {
			throw new Error("Неверный логин или пароль");
		}

		const isPasswordValid = await user.comparePassword(password);

		if (!isPasswordValid) {
			throw new Error("Неверный логин или пароль");
		}

		const token = generateToken({
			id: user.id,
			login: user.login,
			email: user.email,
			role: user.role,
		});

		return {
			message: "Вход выполнен",
			token,
		};
	};

	getCurrentUser = async (userId: number) => {
		const user = await this.userRepository.findById(userId);

		if (!user) {
			throw new Error("Пользователь не найден");
		}

		return user.toSafeObject();
	};
}
