import axios from "axios";
import * as cheerio from "cheerio";
import path from "path";
import { timetableConfig } from "../config/timetable.config";
import { Faculty } from "../models/user.model";
import { LinkInfo } from "../types/timetable.types";

const SCRAPER_TIMEOUT_MS = 15 * 1000;

export class TimetableScraperRepository {
	async getLinks(faculty: Faculty): Promise<LinkInfo[]> {
		const config = timetableConfig[faculty];

		const response = await axios.get<string>(config.url, {
			responseType: "text",
			timeout: SCRAPER_TIMEOUT_MS,
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
				config.keywords.every((kw) => linkText.includes(kw)) &&
				config.linkKeywords.every((kw) => hrefText.includes(kw));

			if (!matches) {
				return;
			}

			const absoluteUrl = this.toAbsoluteUrl(href, config.url);
			if (!absoluteUrl) {
				return;
			}

			const filename = this.normalizeFilename(
				path.basename(absoluteUrl.split("?")[0]),
			);

			links.push({ href: absoluteUrl, filename, faculty });
		});

		return links;
	}

	private toAbsoluteUrl(href: string, base: string): string | null {
		try {
			return new URL(href, base).toString();
		} catch {
			return null;
		}
	}

	private normalizeFilename(encoded: string): string {
		try {
			return decodeURIComponent(encoded);
		} catch {
			return encoded;
		}
	}
}
