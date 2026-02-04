import { Request } from "express";
import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (
	req: Request,
	file: Express.Multer.File,
	callback: multer.FileFilterCallback,
) => {
	const allowedMimeTypes = ["image/png", "image/jpeg"];

	if (allowedMimeTypes.includes(file.mimetype)) {
		callback(null, true);
	} else {
		callback(
			new Error(
				"Некорректный тип файла. Поддерживаются только изображения .png и .jpeg форматов",
			),
		);
	}
};

export const upload = multer({
	storage,
	fileFilter,
	limits: {
		fileSize: 5 * 1024 * 1024,
	},
});
