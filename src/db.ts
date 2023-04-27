import Enmap from "enmap";
import { DateTime, Duration } from "luxon";

/*
--------------
- MISC typed -
--------------
*/

export type ISODate = string; // ISO Date
export type ISODuration = string; // ISO Duration
export type jamID = string; // key of jamDb
export type pollID = string; // key of pollDb
export type proposalID = string; // key of proposalDb
export type userID = string; // Discord user id

/*
------------------
- LaTeX Database -
------------------
*/

export const latexDb = new Enmap<string>("latex"); // key: reply id

/*
---------------------
- Reminder Database -
---------------------
*/

export const reminderTimeoutCache = new Map<string, NodeJS.Timeout>();
// key: unique id
export const reminderDb = new Enmap<Reminder, InternalReminder>({
	name: "reminder",
	serializer: (data) => ({ ...data, timestamp: data.timestamp.toISO() }),
	deserializer: (data) => ({ ...data, timestamp: DateTime.fromISO(data.timestamp, { setZone: true }) }),
});
export interface Reminder {
	timestamp: DateTime;
	message: string;
	channelID: string;
	user: string;
	ping: string | null;
}

interface InternalReminder {
	timestamp: ISODate;
	message: string;
	channelID: string;
	user: string;
	ping: string | null;
}

/*
-----------------------------
- Activity Tracker Database -
-----------------------------
*/

/** Interface for tracker logs */
export interface TrackerLog {
	/** When a log got logged */
	time: ISODate;
	/** How long a game got played */
	playtime: number;
	/** User id of the User who just got logged */
	userid: userID;
	/** Game id of the game which just got logged */
	gameName: string;
}

/** Interface for stripped down tracking logs */
export interface TrackerSublog {
	/** User- or Game- ID */
	id: userID;
	/** How often a User or Game got logged */
	logs: number;
	/** How long a User played a certain game
	 * (Or the other way around)
	 */
	playtime: number;
}

/** Interface for tracking users */
export interface TrackerUser {
	/** How much a user played */
	playtime: number;
	/** Reference to the first log assosiated with the user */
	firstlog: string;
	/** How often a user got logged */
	logs: number;
	/** List of lastest logs */
	lastlogs: string[];
	/** Stripped down logs about how often a game got logged and how long it was played */
	games: TrackerSublog[];
}

/** Interface for tracking games */
export interface TrackerGame {
	/** How much a game got played */
	playtime: number;
	/** Reference to the first log assosiated with the game */
	firstlog: string;
	/** How often a game got logged */
	logs: number;
	/** List of latest logs */
	lastlogs: string[];
	/** Stripped down logs about how often a user got logged and how long they played */
	users: TrackerSublog[];
}

export const trackerLogs = new Enmap<TrackerLog>({ name: "trackerLogs" });
export const trackerUsers = new Enmap<TrackerUser>({ name: "trackerUsers" });
export const trackerGames = new Enmap<TrackerGame>({ name: "trackerGames" });
export const trackerBlacklist = new Enmap<string[]>({ name: "trackerBlacklist" });
trackerBlacklist.ensure("", []);

/*
---------------------
- Proposal Database -
---------------------
*/

// key: unique id
export const proposalDb = new Enmap<Proposal, InternalProposal>({
	name: "proposal",
	serializer: (data) => ({ ...data, created: data.created.toISO(), duration: data.duration.toISO() }),
	deserializer: (data) => ({
		...data,
		created: DateTime.fromISO(data.created, { setZone: true }),
		duration: Duration.fromISO(data.duration),
	}),
});

export interface Proposal {
	title: string;
	abbreviation: string;
	description: string;
	references: string;
	duration: Duration;
	owner: userID;
	votesLastPoll: number;
	totalVotes: number;
	polls: number;
	created: DateTime;
}

interface InternalProposal {
	title: string;
	abbreviation: string;
	description: string;
	references: string;
	duration: ISODuration;
	owner: userID;
	votesLastPoll: number;
	totalVotes: number;
	polls: number;
	created: ISODate;
}

/*
-----------------
- Poll Database -
-----------------
*/

// key: unique id
export const pollDb = new Enmap<Poll, InternalPoll>({
	name: "poll",
	serializer: (data) => ({
		...data,
		start: data.start.toISO(),
		end: data.end.toISO(),
	}),
	deserializer: (data) => ({
		...data,
		start: DateTime.fromISO(data.start, { setZone: true }),
		end: DateTime.fromISO(data.end, { setZone: true }),
	}),
});
export interface Poll {
	title: string;
	start: DateTime;
	end: DateTime;
	numVotes: number;
	numProposals: number;
	selectionType: string;
	votingPrompt: string | null; // id of the message
	exclude: proposalID[];
	include: proposalID[];
	proposals: proposalID[];
	votes: Map<userID, proposalID[]>;
}

interface InternalPoll {
	title: string;
	start: ISODate;
	end: ISODate;
	numVotes: number;
	numProposals: number;
	selectionType: string;
	votingPrompt: string | null; // id of the message
	exclude: proposalID[];
	include: proposalID[];
	proposals: proposalID[];
	votes: Map<userID, proposalID[]>;
}

export const pollTimeoutCache = new Map<string, NodeJS.Timeout>();
// key: unique id
export const pollEventsDb = new Enmap<PollEvent, InternalPollEvent>({
	name: "pollEvents",
	serializer: (data) => ({ ...data, date: data.date.toISO() }),
	deserializer: (data) => ({ ...data, date: DateTime.fromISO(data.date, { setZone: true }) }),
});

export interface PollEvent {
	type: "open" | "close" | "before";
	pollID: pollID;
	promptID: string | null;
	date: DateTime;
}

interface InternalPollEvent {
	type: "open" | "close" | "before";
	pollID: pollID;
	promptID: string | null;
	date: ISODate;
}

/*
----------------
- Jam Database -
-----..---------
*/

// key: unique id
export const jamDb = new Enmap<Jam, InternalJam>({
	name: "jam",
	serializer: (data) => ({
		...data,
		start: data.start.toISO(),
		end: data.end.toISO(),
	}),
	deserializer: (data) => ({
		...data,
		start: DateTime.fromISO(data.start, { setZone: true }),
		end: DateTime.fromISO(data.end, { setZone: true }),
	}),
});

export interface Jam {
	title: string;
	proposal: proposalID;
	start: DateTime;
	end: DateTime;
	resultChannelID: string | null;
	eventID: string | null;
	//pollID: string | null;
}

interface InternalJam {
	title: string;
	proposal: proposalID;
	start: ISODate;
	end: ISODate;
	resultChannelID: string | null;
	eventID: string | null;
	//pollID: string | null;
}

export const jamTimeoutCache = new Map<string, NodeJS.Timeout>();
// key: unique id
export const jamEventsDb = new Enmap<JamEvent, InternalJamEvent>({
	name: "jamEvents",
	serializer: (data) => ({ ...data, date: data.date.toISO() }),
	deserializer: (data) => ({ ...data, date: DateTime.fromISO(data.date, { setZone: true }) }),
});

export interface JamEvent {
	type: "start" | "end" | "createScheduledEvent" | "halftime" | "close-to-end" | "close-to-start";
	jamID: jamID;
	date: DateTime;
}

interface InternalJamEvent {
	type: "start" | "end" | "createScheduledEvent" | "halftime" | "close-to-end" | "close-to-start";
	jamID: jamID;
	date: ISODate;
}

/*
---------------------
- Birthday Database -
---------------------
*/

// key: user id
export const birthdayDb = new Enmap<DateTime, string>({
	name: "birthday",
	serializer: (data) => data.toISO(),
	deserializer: (data) => DateTime.fromISO(data, { setZone: true }),
});
