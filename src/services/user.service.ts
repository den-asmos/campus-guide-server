import { AppError, NotFoundError } from "../errors/app-error";
import { User } from "../models/user.model";
import { UserRepository } from "../repositories/user.repository";
import { MessageResponse } from "../types/response.types";
import { SafeUser, UpdateUser } from "../types/user.types";
import { CloudinaryService } from "./cloudinary.service";

export class UserService {
	constructor(
		private userRepository: UserRepository,
		private cloudinaryService: CloudinaryService,
	) {}

	async getAllUsers(): Promise<User[]> {
		return this.userRepository.findAll();
	}

	async getUserById(id: number): Promise<SafeUser> {
		const user = await this.userRepository.findById(id);
		if (!user) {
			throw new NotFoundError("Пользователь не найден");
		}
		return user.toSafeObject();
	}

	async updateProfile(id: number, dto: UpdateUser): Promise<SafeUser> {
		const updated = await this.userRepository.update(id, dto);
		if (!updated) {
			throw new NotFoundError("Пользователь не найден");
		}
		return updated.toSafeObject();
	}

	async updatePassword(id: number, password: string): Promise<MessageResponse> {
		const user = await this.userRepository.findById(id);
		if (!user) {
			throw new NotFoundError("Пользователь не найден");
		}
		await this.userRepository.updatePassword(id, password);

		return { message: "Пароль изменён" };
	}

	async updateAvatar(id: number, buffer: Buffer): Promise<MessageResponse> {
		const user = await this.userRepository.findById(id);
		if (!user) {
			throw new NotFoundError("Пользователь не найден");
		}

		if (user.avatar) {
			const publicId = this.cloudinaryService.extractPublicId(user.avatar);
			if (publicId) {
				await this.cloudinaryService.deleteImage(publicId);
			}
		}

		const uploadResult = await this.cloudinaryService.uploadImage(
			buffer,
			"avatars",
		);
		await this.userRepository.update(id, {
			avatar: uploadResult.secure_url,
		});

		return { message: "Аватар изменён" };
	}

	async deleteAvatar(id: number): Promise<void> {
		const avatarUrl = await this.userRepository.findAvatarUrl(id);
		if (avatarUrl === undefined) {
			throw new NotFoundError("Пользователь не найден");
		}
		if (!avatarUrl) {
			throw new AppError("У пользователя нет аватара", 400, "NO_AVATAR");
		}

		const publicId = this.cloudinaryService.extractPublicId(avatarUrl);
		if (publicId) {
			await this.cloudinaryService.deleteImage(publicId);
		}

		await this.userRepository.deleteAvatar(id);
	}
}
