import fs from "fs";
import path from "path";

export const ensureDirectoryExistence = (filePath: string) => {
	if (!fs.existsSync(filePath)) {
		fs.mkdirSync(filePath, { recursive: true });
	}
};

export const getDownloadDirectory = () => {
	return path.resolve(process.cwd(), "downloads");
};
