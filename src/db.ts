import Enmap from "enmap";

interface Reminder {
	timestamp: number;
	message: string;
	channel: string;
	user: string;
	callAll: boolean;
}

export const reminderTimeoutCache = new Map<number, NodeJS.Timeout>();
export const reminderDb = new Enmap<number, Reminder>("reminder");
export const latexDb = new Enmap<string, string>("latex");

interface ActivityLogEntry {
	t: number;
	w: number;
}
export const activityTrackerLogDb = new Enmap<string, ActivityLogEntry[]>("TrackerLog");
export const activityTrackerBlacklistDb = new Enmap<string, string[]>("TrackerBlacklist");
activityTrackerBlacklistDb.ensure("general-user", []);
activityTrackerBlacklistDb.ensure("general-game", []);
