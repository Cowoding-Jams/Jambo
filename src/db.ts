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
	time: number;
	when: number;
}

// -- Proposal Database --
export const proposalDb = new Enmap<string, Proposal>("proposal"); // key: title
export interface Proposal {
	title: string;
	description: string;
	references: string;
	timePeriod: string;
	ownerID: string;
	votesLastPoll: number;
	totalVotes: number;
	polls: number;
}

// -- Poll Database --
export const pollDb = new Enmap<string, Poll>("poll"); // key: title
interface Poll {
	title: string;
	startDate: Date;
	endDate: Date;
	proposals: Proposal[];
	votes: Map<string, string[]>; // key: userID, value: proposal titles
}

// -- Jam Database --
export const jamDb = new Enmap<string, Jam>("jam"); // key: title
interface Jam {
	title: string;
	proposal: Proposal;
	startDate: Date;
	endDate: Date;
	timePeriod: number; // in ms
	resultChannelID: string;
}
