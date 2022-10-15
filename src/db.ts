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

export const activityTrackerLogDb = new Enmap<string, Object[]>("TrackerLog");
export const activityTrackerBlacklistDb = new Enmap<string, string[]>("TrackerBlacklist");
activityTrackerBlacklistDb.ensure("general-user", []);
activityTrackerBlacklistDb.ensure("general-game", []);
