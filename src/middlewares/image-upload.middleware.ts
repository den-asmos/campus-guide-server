import { Request } from "express";
import multer from "multer";
import { AppError } from "../errors/app-error";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ["image/png", "image/jpg", "image/webp"];

const storage = multer.memoryStorage();

const fileFilter = (
	req: Request,
	file: Express.Multer.File,
	callback: multer.FileFilterCallback,
) => {
	if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
		callback(null, true);
	} else {
		callback(
			new AppError(
				"Некорректный формат файла (поддерживаются .png, .jpg и .webp",
				400,
				"INVALID_FILE",
			),
		);
	}
};

export const upload = multer({
	storage,
	fileFilter,
	limits: {
		fileSize: MAX_FILE_SIZE,
	},
});
