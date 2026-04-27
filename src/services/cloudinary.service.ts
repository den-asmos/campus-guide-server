import {
	DeleteApiResponse,
	ImageFormat,
	TransformationOptions,
	UploadApiErrorResponse,
	UploadApiResponse,
} from "cloudinary";
import cloudinary from "../config/cloudinary.config";
import { AppError } from "../errors/app-error";

interface UploadDefaults {
	folder: string;
	allowedFormats: ImageFormat[];
	transformation: TransformationOptions;
}

const UPLOAD_DEFAULTS: UploadDefaults = {
	folder: "avatars",
	allowedFormats: ["png", "jpg", "webp"],
	transformation: {
		width: 500,
		height: 500,
		crop: "limit",
		quality: "auto",
		fetch_format: "auto",
	},
};

export class CloudinaryService {
	async uploadImage(
		buffer: Buffer,
		folder: string = UPLOAD_DEFAULTS.folder,
	): Promise<UploadApiResponse> {
		if (!buffer.length) {
			throw new AppError("Буфер файла пустой", 400, "INVALID_FILE");
		}

		return new Promise<UploadApiResponse>((resolve, reject) => {
			const stream = cloudinary.uploader.upload_stream(
				{
					folder,
					resource_type: "image",
					allowed_formats: UPLOAD_DEFAULTS.allowedFormats,
					transformation: UPLOAD_DEFAULTS.transformation,
				},
				(
					error: UploadApiErrorResponse | undefined,
					result: UploadApiResponse | undefined,
				) => {
					if (error) {
						return reject(
							new AppError(
								error.message,
								error.http_code,
								"CLOUDINARY_UPLOAD_ERROR",
							),
						);
					}
					if (!result) {
						return reject(
							new AppError(
								"Нет ответа от cloudinary",
								500,
								"CLOUDINARY_UPLOAD_ERROR",
							),
						);
					}
					resolve(result);
				},
			);

			stream.end(buffer);
		});
	}

	async deleteImage(publicId: string): Promise<DeleteApiResponse> {
		const result = await cloudinary.uploader.destroy(publicId);
		if (result.result === "not found") {
			throw new AppError("Изображение не найдено", 404, "CLOUDINARY_NOT_FOUND");
		}

		return result;
	}

	extractPublicId(url: string): string | null {
		try {
			const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/);
			return match?.[1] ?? null;
		} catch {
			return null;
		}
	}
}
