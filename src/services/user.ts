import { UserUpdateAttributes } from "../models/User";
import { UserRepository } from "../repositories/user";
import { CloudinaryService } from "./cloudinary";

export class UserService {
	private userRepository: UserRepository;
	private cloudinaryService: CloudinaryService;

	constructor() {
		this.userRepository = new UserRepository();
		this.cloudinaryService = new CloudinaryService();
	}

	updateProfile = async (
		userId: number,
		newData: Partial<Omit<UserUpdateAttributes, "password" | "avatar">>,
	) => {
		const user = await this.userRepository.update(userId, newData);
		return user.toSafeObject();
	};

	updateAvatar = async (userId: number, fileBuffer: Buffer) => {
		try {
			const user = await this.userRepository.findById(userId);

			if (!user) {
				throw new Error("Пользователь не найден");
			}

			if (user.avatar) {
				const id = this.cloudinaryService.extractId(user.avatar);

				if (id) {
					await this.cloudinaryService.deleteImage(id);
				}
			}

			const uploadResult = await this.cloudinaryService.uploadImage(
				fileBuffer,
				"avatars",
			);

			await this.userRepository.update(userId, {
				avatar: uploadResult.secure_url,
			});

			return { message: "Аватар изменён" };
		} catch {
			throw new Error("Ошибка изменения аватара");
		}
	};

	deleteAvatar = async (userId: number) => {
		try {
			const avatarUrl = await this.userRepository.findAvatarUrl(userId);

			if (!avatarUrl) {
				throw new Error("У пользователя нет аватара");
			}

			const id = this.cloudinaryService.extractId(avatarUrl);

			if (id) {
				await this.cloudinaryService.deleteImage(id);
			}

			await this.userRepository.deleteAvatar(userId);

			return {
				message: "Аватар удалён",
			};
		} catch {
			throw new Error("Ошибка удаления аватара");
		}
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
