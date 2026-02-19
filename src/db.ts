import Enmap from "enmap";
import { DateTime, Duration } from "luxon";

// -- LaTeX Database --
export const latexDb = new Enmap<string, string>("latex"); // key: reply id

// -- Reminder Database --
export const reminderTimeoutCache = new Map<string, NodeJS.Timeout>();
// key: unique id
export const reminderDb = new Enmap<string, Reminder, InternalReminder>({
	name: "reminder",
	serializer: (data) => ({ ...data, timestamp: data.timestamp.toISO()! }),
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

// -- Activity Tracker Database --
export const activityTrackerBlacklistDb = new Enmap<string, string[]>("trackerBlacklist");
activityTrackerBlacklistDb.ensure("general-user", []);
activityTrackerBlacklistDb.ensure("general-game", []);

// key: "[user id]-[game]"
export const activityTrackerLogDb = new Enmap<string, ActivityLogEntry[], InternalActivityLogEntry[]>({
	name: "trackerLog",
	serializer: (data) => data.map((e) => ({ duration: e.duration.toISO()!, date: e.date.toISO()! })),
	deserializer: (data) =>
		data.map((e) => ({
			duration: Duration.fromISO(e.duration),
			date: DateTime.fromISO(e.date, { setZone: true }),
		})),
});

export interface ActivityLogEntry {
	duration: Duration;
	date: DateTime;
}

interface InternalActivityLogEntry {
	duration: ISODuration;
	date: ISODate;
}

// -- MISC --
// Types
export type ISODate = string; // ISO Date
export type ISODuration = string; // ISO Duration
export type jamID = string; // key of jamDb
export type pollID = string; // key of pollDb
export type proposalID = string; // key of proposalDb
export type userID = string; // Discord user id

// -- Proposal Database --
// key: unique id
export const proposalDb = new Enmap<string, Proposal, InternalProposal>({
	name: "proposal",
	serializer: (data) => ({ ...data, created: data.created.toISO()!, duration: data.duration.toISO()! }),
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
	used: boolean;
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
	used: boolean;
}

// -- Poll Database --
// key: unique id
export const pollDb = new Enmap<string, Poll, InternalPoll>({
	name: "poll",
	serializer: (data) => ({
		...data,
		start: data.start.toISO()!,
		end: data.end.toISO()!,
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
export const pollEventsDb = new Enmap<string, PollEvent, InternalPollEvent>({
	name: "pollEvents",
	serializer: (data) => ({ ...data, date: data.date.toISO()! }),
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

// -- Jam Database --
// key: unique id
export const jamDb = new Enmap<string, Jam, InternalJam>({
	name: "jam",
	serializer: (data) => ({
		...data,
		start: data.start.toISO()!,
		end: data.end.toISO()!,
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
export const jamEventsDb = new Enmap<string, JamEvent, InternalJamEvent>({
	name: "jamEvents",
	serializer: (data) => ({ ...data, date: data.date.toISO()! }),
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

// -- Birthday Database --
// key: user id
export const birthdayDb = new Enmap<string, DateTime, string>({
	name: "birthday",
	serializer: (data) => data.toISO()!,
	deserializer: (data) => DateTime.fromISO(data, { setZone: true }),
});
