import Enmap from "enmap";

// -- LaTeX Database --
export const latexDb = new Enmap<string>("latex");

// -- Reminder Database --
export const reminderTimeoutCache = new Map<string, NodeJS.Timeout>();
export const reminderDb = new Enmap<Reminder>("reminder");
interface Reminder {
	timestamp: string; // ISO
	message: string;
	channelID: string;
	user: string;
	ping: string | null;
}

// -- Game Activity Tracker Database --
export const activityTrackerLogDb = new Enmap<ActivityLogEntry[]>("TrackerLog");
export const activityTrackerBlacklistDb = new Enmap<string[]>("TrackerBlacklist");
activityTrackerBlacklistDb.ensure("general-user", []);
activityTrackerBlacklistDb.ensure("general-game", []);
interface ActivityLogEntry {
	time: number;
	when: number;
}

// -- Proposal Database --
export const proposalDb = new Enmap<Proposal>("proposal"); // key: unique id
export interface Proposal {
	title: string;
	description: string;
	references: string;
	duration: string; // ISO Duration
	ownerID: string;
	votesLastPoll: number;
	totalVotes: number;
	polls: number;
	created: string; // ISO
}

// -- Poll Database --
export const pollDb = new Enmap<Poll>("poll"); // key: unique id
interface Poll {
	title: string;
	startDate: string; // ISO
	endDate: string; // ISO
	numVotes: number;
	numProposals: number;
	excluded: string[]; // keys of proposalDb
	include: string[]; // keys of proposalDb
	proposals: string[]; // keys of proposalDb
	votes: Map<string, string[]>; // key: userID, value: proposal titles
}

// -- Jam Database --
export const jamDb = new Enmap<Jam>("jam"); // key: unique id
interface Jam {
	title: string;
	proposal: Proposal;
	startDate: string; // ISO
	endDate: string; // ISO
	duration: string; // ISO Duration
	resultChannelID: string;
}
