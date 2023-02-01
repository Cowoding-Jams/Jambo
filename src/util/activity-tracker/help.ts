import { activityTrackerBlacklistDb, activityTrackerLogDb } from "../../db";
import { EmbedField } from "discord.js";
import { discordRelativeTimestamp, durationToReadable } from "../misc/time";
import { DateTime, Duration } from "luxon";

export async function getBlacklist(userid: string): Promise<string[] | undefined> {
	if (!activityTrackerBlacklistDb.has(userid)) return [];
	return activityTrackerBlacklistDb.get(userid);
}

export function getEntries(user?: string, game?: string): string[] {
	let entries = activityTrackerLogDb.keyArray().map((e) => splitId(e));

	if (user) {
		entries = entries.filter((e) => e.user === user);
	}

	if (game) {
		entries = entries.filter((e) => e.game === game);
	}

	return entries.map((e) => joinId(e));
}

export async function makeStats(entries: string[]): Promise<Array<EmbedField>> {
	if (entries.length == 0) {
		return [];
	}

	let firstEntry = DateTime.now().plus({ years: 1000 });
	let lastEntry = DateTime.now().minus({ years: 1000 });
	let playTime = Duration.fromObject({ seconds: 0 });
	let longestRecord = Duration.fromObject({ seconds: 0 });
	let totalRecords = 0;

	entries.forEach((key) => {
		const logs = activityTrackerLogDb.get(key);
		logs?.forEach((log) => {
			totalRecords += 1;
			playTime = playTime.plus(log.duration);
			if (log.date < firstEntry) firstEntry = log.date;
			if (log.date > lastEntry) lastEntry = log.date;
			if (log.duration > longestRecord) longestRecord = log.duration;
		});
	});

	let dayDifference = lastEntry.diff(firstEntry).as("days");
	dayDifference = dayDifference < 1 ? 1 : dayDifference;

	const fields = [
		{ name: "Record Range", value: `≈ ${Math.round(dayDifference)} days`, inline: true },
		{ name: "Total Playtime", value: durationToReadable(playTime, true), inline: true },
		{
			name: "Playtime/Day",
			value: durationToReadable(
				Duration.fromObject({ seconds: Math.floor(playTime.as("seconds") / dayDifference) }),
				true
			),
			inline: true,
		},
		{
			name: "First Record",
			value: `${discordRelativeTimestamp(firstEntry)}`,
			inline: true,
		},
		{
			name: "Last Record",
			value: `${discordRelativeTimestamp(lastEntry)}`,
			inline: true,
		},
		{ name: "Longest Record", value: durationToReadable(longestRecord, true), inline: true },
		{ name: "Total Records", value: totalRecords.toString(), inline: true },
	];

	return fields;
}

/** Splits the key into the userID and game */
export function splitId(id: string): { user: string; game: string } {
	const [user, ...gameParts] = id.split("-");
	const game = gameParts.join("-");
	return { user: user, game: game };
}

function joinId(element: { user: string; game: string }): string {
	return `${element.user}-${element.game}`;
}
