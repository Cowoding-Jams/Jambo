import Enmap from "enmap";

interface rmdDb {
	timeout: NodeJS.Timeout;
	destination: number;
	message: string;
	caller_id: string;
	notify_all: boolean;
}

export const timeDb = new Map<number, rmdDb>();
export const latexDb = new Enmap<string, string>("latex");


interface ActivityLogEntry {
    t: number;
    w: number;
}
export const activityTrackerLogDb = new Enmap<string, ActivityLogEntry[]>("TrackerLog");
export const activityTrackerBlacklistDb = new Enmap<string, string[]>("TrackerBlacklist");
activityTrackerBlacklistDb.ensure("general-user", []);
activityTrackerBlacklistDb.ensure("general-game", []);