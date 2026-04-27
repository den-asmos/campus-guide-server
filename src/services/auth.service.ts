import { CreationAttributes } from "sequelize";
import { AppError, ConflictError, NotFoundError } from "../errors/app-error";
import { User } from "../models/user.model";
import { UserRepository } from "../repositories/user.repository";
import { SafeUser } from "../types/user.types";
import { TokenService } from "./token.service";

interface SignInDto {
	login: string;
	password: string;
}

interface AuthResponse {
	token: string;
}

export class AuthService {
	constructor(
		private userRepository: UserRepository,
		private tokenService: TokenService,
	) {}

	async signUp(dto: CreationAttributes<User>): Promise<AuthResponse> {
		const [existingByLogin, existingByEmail] = await Promise.all([
			this.userRepository.findByLogin(dto.login),
			this.userRepository.findByEmail(dto.email),
		]);

		if (existingByLogin) {
			throw new ConflictError("Пользователь с таким логином уже существует");
		}
		if (existingByEmail) {
			throw new ConflictError("Пользователь с таким email уже существует");
		}

		const user = await this.userRepository.create(dto);

		const token = this.tokenService.generate({
			id: user.id,
			login: user.login,
			email: user.email,
			role: user.role,
		});

		return { token };
	}

	async signIn(dto: SignInDto): Promise<AuthResponse> {
		const user = await this.userRepository.findByLogin(dto.login);

		const invalidCredentialsError = new AppError(
			"Неверный логин или пароль",
			401,
			"INVALID_CREDENTIALS",
		);

		if (!user) {
			throw invalidCredentialsError;
		}

		const isPasswordValid = await user.comparePassword(dto.password);
		if (!isPasswordValid) {
			throw invalidCredentialsError;
		}

		const token = this.tokenService.generate({
			id: user.id,
			login: user.login,
			email: user.email,
			role: user.role,
		});

		return { token };
	}

	async getCurrentUser(userId: number): Promise<SafeUser> {
		const user = await this.userRepository.findById(userId);
		if (!user) {
			throw new NotFoundError("Пользователь не найден");
		}
		return user.toSafeObject();
	}
}
