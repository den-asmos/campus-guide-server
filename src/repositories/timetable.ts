import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";
import path from "path";
import { pipeline } from "stream";
import { URL } from "url";
import { timetableConfig } from "../config/timetable";
import { Faculty } from "../models/User";

export type LinkInfo = {
	href: string;
	filename: string;
	faculty: Faculty;
};

export class TimetableRepository {
	async getLinks(faculty: Faculty) {
		const config = timetableConfig[faculty];
		const pageUrl = config.url;

		const response = await axios.get(pageUrl, {
			responseType: "text",
			timeout: 15000,
		});
		const $ = cheerio.load(response.data);

		const links: LinkInfo[] = [];
		$('td:first-child a[href$=".xlsx"]').each((_, element) => {
			const href = $(element).attr("href");

			if (!href) {
				return;
			}

			const linkText = $(element).text().toLowerCase();
			const hrefText = href.toLowerCase();

			const matches =
				config.keywords.every((keyword) => linkText.includes(keyword)) &&
				config.linkKeywords.every((linkKeyword) =>
					hrefText.includes(linkKeyword),
				);

			if (!matches) {
				return;
			}

			const absoluteUrl = this.toAbsoluteUrl(href, pageUrl);
			const filename = path.basename(absoluteUrl.split("?")[0]);
			const normalizedFilename = this.normalizeFilename(filename);

			links.push({ href: absoluteUrl, filename: normalizedFilename, faculty });
		});

		return links;
	}

	async downloadFile(url: string, outPath: string) {
		const response = await axios.get(url, {
			responseType: "stream",
			timeout: 30000,
			maxRedirects: 5,
		});

		const writer = fs.createWriteStream(outPath);

		await new Promise<void>((resolve, reject) => {
			pipeline(response.data, writer, (error) => {
				if (error) {
					reject(error);
				} else {
					resolve();
				}
			});
		});
	}

	async fileExists(filePath: string): Promise<boolean> {
		try {
			await fs.promises.access(filePath);
			return true;
		} catch {
			return false;
		}
	}

	private toAbsoluteUrl(href: string, base: string) {
		try {
			return new URL(href, base).toString();
		} catch (error) {
			return href;
		}
	}

	private normalizeFilename(urlEncodedName: string) {
		try {
			return decodeURIComponent(urlEncodedName);
		} catch (error) {
			return urlEncodedName;
		}
	}
}
