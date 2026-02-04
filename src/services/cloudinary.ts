import { UploadApiErrorResponse, UploadApiResponse } from "cloudinary";
import cloudinary from "../config/cloudinary";

export class CloudinaryService {
	uploadImage = async (
		fileBuffer: Buffer,
		folder: string = "avatars",
	): Promise<UploadApiResponse> => {
		return new Promise((resolve, reject) => {
			const uploadStream = cloudinary.uploader.upload_stream(
				{
					folder,
					resource_type: "image",
					transformation: [
						{
							width: 500,
							height: 500,
							crop: "limit",
							quality: "auto",
							fetch_format: "auto",
						},
					],
					allowed_formats: ["png", "jpeg"],
				},
				(
					error: UploadApiErrorResponse | undefined,
					result: UploadApiResponse | undefined,
				) => {
					if (error) {
						reject(error);
					} else if (result) {
						resolve(result);
					} else {
						reject(new Error("Ошибка загрузки изображения"));
					}
				},
			);

			uploadStream.end(fileBuffer);
		});
	};

	deleteImage = async (id: string) => {
		try {
			return await cloudinary.uploader.destroy(id);
		} catch (error) {
			throw new Error(`Ошибка удаления изображения: ${error}`);
		}
	};

	extractId = (url: string) => {
		try {
			const matches = url.match(/\/(?:v\d+\/)?(.+)\.\w+$/);
			return matches ? matches[1] : null;
		} catch {
			return null;
		}
	};
}
