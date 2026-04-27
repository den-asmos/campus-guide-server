import { Faculty } from "../../models/user.model";

interface CacheEntry {
	timestamp: number;
	filePaths: string[];
}

const DEFAULT_TTL_MS = 12 * 60 * 60 * 1000;

export class TimetableCache {
	private store = new Map<Faculty, CacheEntry>();

	constructor(private ttlMs: number = DEFAULT_TTL_MS) {}

	get(faculty: Faculty): string[] | null {
		const entry = this.store.get(faculty);
		if (!entry) {
			return null;
		}

		const isExpired = Date.now() - entry.timestamp >= this.ttlMs;
		return isExpired ? null : entry.filePaths;
	}

	set(faculty: Faculty, filePaths: string[]) {
		this.store.set(faculty, {
			timestamp: Date.now(),
			filePaths,
		});
	}

	invalidate(faculty: Faculty) {
		this.store.delete(faculty);
	}

	invalidateAll() {
		this.store.clear();
	}
}
