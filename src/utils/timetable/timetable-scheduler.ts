import logger from "../logger";
import { TimetableDownloader } from "./timetable-downloader";

const DEFAULT_INTERVAL_MS = 24 * 60 * 60 * 1000;

export class TimetableScheduler {
	private isRefreshing = false;
	private intervalHandle: NodeJS.Timeout | null = null;

	constructor(
		private downloader: TimetableDownloader,
		private intervalMs: number = DEFAULT_INTERVAL_MS,
	) {}

	start() {
		this.refresh().catch((error) =>
			logger.error(
				`[Timetable Scheduler] Initial timetable refresh failed: ${error}`,
			),
		);

		this.intervalHandle = setInterval(
			() =>
				this.refresh().catch((error) =>
					logger.error(
						`[Timetable Scheduler] Scheduled timetable refresh failed: ${error}`,
					),
				),
			this.intervalMs,
		);
	}

	stop() {
		if (this.intervalHandle) {
			clearInterval(this.intervalHandle);
			this.intervalHandle = null;
		}
	}

	private async refresh(): Promise<void> {
		if (this.isRefreshing) {
			return;
		}

		this.isRefreshing = true;
		try {
			logger.info("[Timetable Scheduler] Timetable refresh started...");
			await this.downloader.downloadAll();
			logger.info("[Timetable Scheduler] Timetable refresh completed");
		} finally {
			this.isRefreshing = false;
		}
	}
}
