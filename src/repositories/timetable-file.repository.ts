import axios from "axios";
import fs from "fs";
import { pipeline } from "stream/promises";

const DOWNLOAD_TIMEOUT_MS = 30 * 1000;

export class TimetableFileRepository {
	async download(url: string, outPath: string): Promise<void> {
		const response = await axios.get<NodeJS.ReadableStream>(url, {
			responseType: "stream",
			timeout: DOWNLOAD_TIMEOUT_MS,
			maxRedirects: 5,
		});

		const writer = fs.createWriteStream(outPath);
		await pipeline(response.data, writer);
	}

	async exists(filePath: string): Promise<boolean> {
		try {
			await fs.promises.access(filePath);
			return true;
		} catch {
			return false;
		}
	}
}
