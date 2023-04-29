import { EmbedBuilder, InteractionReplyOptions } from "discord.js";
import { Duration } from "luxon";
import { trackerUsers } from "../../db";
import { durationToReadable } from "../misc/time";

/** Uses `durationToReadable` from src/util/misc/time.ts but without the need to parse a Duration object */
export function makeTimeString(timeMS: number) {
	return durationToReadable(Duration.fromMillis(timeMS), true);
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
export function errorEmbed(title: string, info: string): InteractionReplyOptions {
	return {
		embeds: [
			new EmbedBuilder()
				.setTitle(`ERROR: ${title}`)
				.setDescription(`further info:\n\`\`\`${info}\`\`\``)
				.setColor([255, 0, 0]),
		],
		ephemeral: true,
	};
}
/** Make an success embed */
export function confirmEmbed(title: string): InteractionReplyOptions {
	return {
		embeds: [new EmbedBuilder().setTitle(title).setColor([0, 255, 0])],
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
