import { activityTrackerBlacklistDb, activityTrackerLogDb } from "../../db";
import { EmbedField } from "discord.js";
import { msToReadable } from "../misc/time";

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

	let firstEntry = Infinity;
	let lastEntry = 0;
	let playTime = 0;
	let longestRecord = 0;
	let totalRecords = 0;

	entrys.forEach((game) => {
		const logs = activityTrackerLogDb.get(game);
		logs?.forEach((log) => {
			totalRecords += 1;
			playTime += log.time;
			if (log.when < firstEntry) firstEntry = log.when;
			if (log.when > lastEntry) lastEntry = log.when;
			if (log.time > longestRecord) longestRecord = log.time;
		});
	});

	let dayDifference = Math.floor(lastEntry / 86400000) - Math.floor(firstEntry / 86400000);
	dayDifference = dayDifference == 0 ? 1 : dayDifference;

	const average = Math.floor(playTime / dayDifference);

	const fields = [
		{ name: "Record Range", value: `${dayDifference} days`, inline: true },
		{ name: "Total Playtime", value: msToReadable(playTime, true), inline: true },
		{ name: "Playtime/Day", value: msToReadable(average, true), inline: true },
		{
			name: "First Record",
			value: `<t:${Math.floor(firstEntry / 1000)}:R>`,
			inline: true,
		},
		{
			name: "Last Record",
			value: `<t:${Math.floor(lastEntry / 1000)}:R>`,
			inline: true,
		},
		{ name: "Longest Record", value: msToReadable(longestRecord, true), inline: true },
		{ name: "Total Records", value: `${totalRecords}`, inline: true },
	];

	return fields;
}

export function splitId(id: string): [string, string] {
	const [user, ...gameParts] = id.split("-");
	const game = gameParts.join("-");
	return [user, game];
}
