import Enmap from "enmap";

interface Reminder {
	timestamp: number;
	message: string;
	channelID: string;
	pings: string[];
}
interface ActivityLogEntry {
	t: number;
	w: number;
}
export interface Birthday {
	month: number;
	day: number;
}


export const reminderTimeoutCache = new Map<number, NodeJS.Timeout>();
export const reminderDb = new Enmap<number, Reminder>("reminder");
export const latexDb = new Enmap<string, string>("latex");
export const birthdayDb = new Enmap<string, Birthday>("birthday");
export const activityTrackerLogDb = new Enmap<string, ActivityLogEntry[]>("TrackerLog");
export const activityTrackerBlacklistDb = new Enmap<string, string[]>("TrackerBlacklist");
activityTrackerBlacklistDb.ensure("general-user", []);
activityTrackerBlacklistDb.ensure("general-game", []);
