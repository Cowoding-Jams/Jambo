import { activityTrackerBlacklistDb, activityTrackerLogDb } from "../../db";
import { EmbedField } from "discord.js";
import { discordRelativeTimestamp, durationToReadable } from "../misc/time";
import { DateTime, Duration } from "luxon";

export async function getBlacklist(userid: string): Promise<string[] | undefined> {
	if (!activityTrackerBlacklistDb.has(userid)) return [];
	return activityTrackerBlacklistDb.get(userid);
}

export async function getEntrys(
	user: string | undefined | null,
	game: string | undefined | null
): Promise<string[]> {
	const allEntrys = activityTrackerLogDb.keyArray();
	const found: string[] = [];
	const userCheck = (usr: string) => {
		return usr == user || user == undefined;
	};
	const gameCheck = (gae: string) => {
		return gae == game || game == undefined;
	};

	allEntrys.forEach((key) => {
		const [userEntry, gameEntry] = splitId(key);

		if (userCheck(userEntry) && gameCheck(gameEntry)) {
			const entry = activityTrackerLogDb.get(key);
			if (entry !== undefined) found.push(key);
		} else if (userCheck(userEntry) && !gameCheck(gameEntry)) {
			if (gameEntry !== game) return;
			const entry = activityTrackerLogDb.get(key);
			if (entry !== undefined) found.push(key);
		} else if (!userCheck(userEntry) && gameCheck(gameEntry)) {
			if (userEntry !== user) return;
			const entry = activityTrackerLogDb.get(key);
			if (entry !== undefined) found.push(key);
		} else if (!userCheck(userEntry) && !gameCheck(gameEntry)) {
			if (userEntry !== user || gameEntry !== game) return;
			const entry = activityTrackerLogDb.get(key);
			if (entry !== undefined) found.push(key);
		}
	});
	return found;
}

export async function makeStats(entrys: string[]): Promise<Array<EmbedField>> {
	if (entrys.length == 0) {
		return [];
	}

	let firstEntry = DateTime.now().plus({ years: 1000 });
	let lastEntry = DateTime.now().minus({ years: 1000 });
	const playTime = Duration.fromObject({ seconds: 0 });
	let longestRecord = Duration.fromObject({ seconds: 0 });
	let totalRecords = 0;

	entrys.forEach((game) => {
		const logs = activityTrackerLogDb.get(game);
		logs?.forEach((log) => {
			totalRecords += 1;
			playTime.plus(log.duration);
			if (log.date < firstEntry) firstEntry = log.date;
			if (log.date > lastEntry) lastEntry = log.date;
			if (log.duration > longestRecord) longestRecord = log.duration;
		});
	});

	let dayDifference = firstEntry.diff(lastEntry).as("days");
	dayDifference = dayDifference == 0 ? 1 : dayDifference;

	const fields = [
		{ name: "Record Range", value: `≈ ${Math.round(dayDifference)} days`, inline: true },
		{ name: "Total Playtime", value: durationToReadable(playTime), inline: true },
		{
			name: "Playtime/Day",
			value: durationToReadable(
				Duration.fromObject({ seconds: Math.floor(playTime.as("seconds") / dayDifference) })
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
		{ name: "Longest Record", value: durationToReadable(longestRecord), inline: true },
		{ name: "Total Records", value: totalRecords.toString(), inline: true },
	];

	return fields;
}

export function splitId(id: string): [string, string] {
	const [user, ...gameParts] = id.split("-");
	const game = gameParts.join("-");
	return [user, game];
}
