import { Activity, ActivityType, Presence } from "discord.js";
import {
	trackerBlacklist,
	TrackerGame,
	trackerGames,
	TrackerLog,
	trackerLogs,
	TrackerUser,
	trackerUsers,
} from "../../db";

export async function getChangedActivities(
	oldPresence: Presence | null,
	newPresence: Presence
): Promise<{ started: Activity[]; stopped: Activity[] }> {
	const oldActivities = oldPresence?.activities.filter((value) => value.type === ActivityType.Playing);
	const newActivities = newPresence.activities.filter((value) => value.type === ActivityType.Playing);

	const stopped: Activity[] = [];
	oldActivities?.forEach((activity) => {
		if (!newActivities.some((newActivity) => newActivity.name === activity.name)) stopped.push(activity);
	});

	const started: Activity[] = [];
	newActivities.forEach((activity) => {
		if (!oldActivities?.some((oldActivity) => oldActivity.name === activity.name)) started.push(activity);
	});

	return { started, stopped };
}

/** Checks if the name of an game is on the blacklist (case gets ignored) */
export function isBlacklisted(gameName: string): boolean {
	return trackerBlacklist.get("")?.includes(gameName.toLowerCase()) || false;
}

export async function logIt(gameName: string, userID: string, timePlayed: number): Promise<void> {
	gameName = gameName.toLowerCase();
	if (isBlacklisted(gameName)) return;

	const logID = (trackerLogs.count + 1).toString(); // make new a unique ID for the new log
	ensure(gameName, userID, logID); // make sure user and game exist
	updateUser(gameName, userID, timePlayed, logID); // update users db entry
	updateGame(gameName, userID, timePlayed, logID); // update games db entry
	addLog(gameName, userID, timePlayed, logID); // make a db entry for this new log
}

function ensure(gameName: string, userID: string, logID: string) {
	if (!trackerGames.has(gameName.toLowerCase())) {
		const data: TrackerGame = {
			playtime: 0,
			firstlog: logID,
			logs: 0,
			lastlogs: [],
			users: [],
		};
		trackerGames.set(gameName.toLowerCase(), data);
	}
	if (!trackerUsers.has(userID)) {
		const data: TrackerUser = {
			playtime: 0,
			firstlog: logID,
			logs: 0,
			lastlogs: [],
			games: [],
		};
		trackerUsers.set(userID, data);
	}
}

function updateUser(gameName: string, userID: string, timePlayed: number, logID: string) {
	gameName = gameName.toLowerCase();

	const data: TrackerUser | undefined = trackerUsers.get(userID);

	if (!data) return;

	// remove oldest log from the latest log history
	if (data.lastlogs.length >= 5) data.lastlogs.shift();
	data.lastlogs.push(logID); // add newest log to the log history

	data.logs += 1;
	data.playtime += timePlayed;

	let gamelog = data.games.find((e) => e.id == gameName);
	if (!gamelog) {
		gamelog = data.games[data.games.push({ id: gameName, logs: 0, playtime: 0 }) - 1];
	}
	gamelog.logs += 1;
	gamelog.playtime += timePlayed;

	trackerUsers.set(userID, data);
}

function updateGame(gameName: string, userID: string, timePlayed: number, logID: string) {
	gameName = gameName.toLowerCase();

	const data: TrackerGame | undefined = trackerGames.get(gameName);
	if (!data) return;

	// remove oldest log from the latest log history
	if (data.lastlogs.length >= 5) data.lastlogs.shift();
	data.lastlogs.push(logID); // add newest log to the log history

	data.logs += 1;
	data.playtime += timePlayed;

	let gamelog = data.users.find((e) => e.id == userID);
	if (!gamelog) {
		gamelog = data.users[data.users.push({ id: userID, logs: 0, playtime: 0 }) - 1];
	}
	gamelog.logs += 1;
	gamelog.playtime += timePlayed;

	trackerGames.set(gameName, data);
}

function addLog(gameName: string, userID: string, timePlayed: number, logID: string) {
	const data: TrackerLog = {
		gameName: gameName,
		userid: userID,
		time: new Date().toISOString(),
		playtime: timePlayed,
	};
	trackerLogs.set(logID, data);
}
