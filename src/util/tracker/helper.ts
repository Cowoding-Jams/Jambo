import { InteractionReplyOptions } from "discord.js";
import { Duration } from "luxon";
import { trackerUsers } from "../../db";
import { durationToReadable } from "../misc/time";

/** Uses `durationToReadable` from src/util/misc/time.ts but without the need to parse a Duration object */
export function makeTimeString(timeSeconds: number) {
	const str = durationToReadable(Duration.fromMillis(Math.round(timeSeconds) * 1000), true);
	return str.length >= 1 ? str : "0s";
}
/** Sorts users games after playtime of a user (most playtime at index 0)*/
export function sortGamesPlaytime(userId: string) {
	const data = trackerUsers.get(userId);
	return data?.games.sort((a, b) => b.playtime - a.playtime);
}
/** Sorts users games after amount of logs of a user (most logs at index 0) */
export function sortGamesLogs(userId: string) {
	const data = trackerUsers.get(userId);
	return data?.games.sort((a, b) => b.logs - a.logs);
}
/** Make an error embed */
export function errorMessage(title: string, info: string): InteractionReplyOptions {
	return {
		content: `${title}: ${info}`,
		ephemeral: true,
	};
}
/** Make an success embed */
export function confirmMessage(title: string): InteractionReplyOptions {
	return {
		content: title,
		ephemeral: true,
	};
}

/** Sort database entries, given a sorting and maping callback */
export function sortDbToString<T>(db: T[], sortFn: (a: T, b: T) => number, mapFn: (log: T) => string) {
	return db
		.sort((a, b) => sortFn(a, b))
		.slice(0, 5)
		.map((log) => mapFn(log))
		.join("\n");
}
