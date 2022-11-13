import Enmap from "enmap";

// -- LaTeX Database --
export const latexDb = new Enmap<string, string>("latex");

// -- Reminder Database --
export const reminderTimeoutCache = new Map<number, NodeJS.Timeout>();
export const reminderDb = new Enmap<number, Reminder>("reminder");
interface Reminder {
	timestamp: number;
	message: string;
	channelID: string;
	pings: string[];
}

// -- Game Activity Tracker Database --
export const activityTrackerLogDb = new Enmap<string, ActivityLogEntry[]>("TrackerLog");
export const activityTrackerBlacklistDb = new Enmap<string, string[]>("TrackerBlacklist");
activityTrackerBlacklistDb.ensure("general-user", []);
activityTrackerBlacklistDb.ensure("general-game", []);
interface ActivityLogEntry {
	t: number;
	w: number;
}

// -- Proposal Database --
export const proposalDb = new Enmap<string, Proposal>("proposal");
export interface Proposal {
	title: string;
	description: string;
	references: string;
	timePeriod: string;
	owner: string;
}

// -- Poll Database --
export const pollDb = new Enmap<string, Poll>("poll");
interface Poll {
	title: string;
}
