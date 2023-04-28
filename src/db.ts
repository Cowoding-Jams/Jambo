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
--------------------
- Tracker Database -
--------------------
*/

/** Interface for tracker logs */
export interface TrackerLog {
	/** id of the log */
	id: string;
	/** When a log got logged */
	date: Date;
	/** How long a game got played in ms*/
	playtime: number;
	/** User id of the User who just got logged */
	userID: userID;
	/** Game name of the game which just got logged */
	gameName: string;
}

/** Interface for stripped down tracking logs */
export interface TrackerSublog {
	/** User- or Game- ID */
	name: userID;
	/** How often a User or Game got logged */
	logs: number;
	/** How long a User played a certain game in ms
	 * (Or the other way around) */
	playtime: number;
}

/** Interface for tracking users */
export interface TrackerUser {
	/** How long a user played a game in ms*/
	playtime: number;
	/** ID of the first log associated with the user */
	firstlog: TrackerLog;
	/** How often a user got logged */
	logs: number;
	/** List of the latest 5 logs in form of the log ID*/
	lastlogs: TrackerLog[];
	/** Little infos about the game which the user played (id, log amount, time played in total)*/
	games: TrackerSublog[];
}

/** Interface for tracking games */
export interface TrackerGame {
	/** How long a game got played in ms*/
	playtime: number;
	/** ID of the first log associated with the game */
	firstlog: TrackerLog;
	/** How often a game got logged */
	logs: number;
	//** List of the latest 5 logs in form of the log ID*/
	lastlogs: TrackerLog[];
	/** Little infos about the users who played the game (id, log amount, time played in total)*/
	users: TrackerSublog[];
}

interface internalTrackerLog {
	id: string;
	date: ISODate;
	playtime: number;
	userID: userID;
	gameName: string;
}
interface internalTrackerGameAndUser {
	playtime: number;
	firstlog: string;
	logs: number;
	lastlogs: string[];
	games: TrackerSublog[];
	users: TrackerSublog[];
}

// just in case a referenced log wasnt found.
// Although there really isnt any reason why there should accrue such a case.
// Better safe than sorry and to make ts happy of course!
const unknownTrackerLog: TrackerLog = {
	id: "-1",
	date: new Date(2000, 4, 0, 4),
	playtime: -1,
	userID: "0000000000000000000",
	gameName: "[unknown log]",
};

export const trackerLogs = new Enmap<TrackerLog, internalTrackerLog>({
	name: "trackerLogs",
	serializer: (data) => ({ ...data, date: data.date.toISOString() }),
	deserializer: (data) => ({ ...data, date: new Date(data.date) }),
});
export const trackerUsers = new Enmap<TrackerUser, internalTrackerGameAndUser>({
	name: "trackerUsers",
	serializer: (data) => ({
		...data,
		firstlog: data.firstlog.id,
		lastlogs: data.lastlogs.map((log) => log.id),
		users: [],
	}),
	deserializer: (data) => ({
		...data,
		firstlog: trackerLogs.get(data.firstlog) ?? unknownTrackerLog,
		lastlogs: data.lastlogs.map((logID) => trackerLogs.get(logID) ?? unknownTrackerLog),
	}),
});
export const trackerGames = new Enmap<TrackerGame, internalTrackerGameAndUser>({
	name: "trackerGames",
	serializer: (data) => ({
		...data,
		firstlog: data.firstlog.id,
		lastlogs: data.lastlogs.map((log) => log.id),
		games: [],
	}),
	deserializer: (data) => ({
		...data,
		firstlog: trackerLogs.get(data.firstlog) ?? unknownTrackerLog,
		lastlogs: data.lastlogs.map((logID) => trackerLogs.get(logID) ?? unknownTrackerLog),
	}),
});
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
----------------
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
