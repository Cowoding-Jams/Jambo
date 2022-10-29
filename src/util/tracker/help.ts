import { activityTrackerBlacklistDb, activityTrackerLogDb } from "../../db";
import { EmbedField } from "discord.js";

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

	allEntrys.forEach((element) => {
		const [userEntry, gameEntry] = splitId(element);

		if (userCheck(userEntry) && gameCheck(gameEntry)) {
			const entry = activityTrackerLogDb.get(element);
			if (entry !== undefined) found.push(element);
		} else if (userCheck(userEntry) && !gameCheck(gameEntry)) {
			if (gameEntry !== game) return;
			const entry = activityTrackerLogDb.get(element);
			if (entry !== undefined) found.push(element);
		} else if (!userCheck(userEntry) && gameCheck(gameEntry)) {
			if (userEntry !== user) return;
			const entry = activityTrackerLogDb.get(element);
			if (entry !== undefined) found.push(element);
		} else if (!userCheck(userEntry) && !gameCheck(gameEntry)) {
			if (userEntry !== user || gameEntry !== game) return;
			const entry = activityTrackerLogDb.get(element);
			if (entry !== undefined) found.push(element);
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
			playTime += log.t;
			if (log.w < firstEntry) firstEntry = log.w;
			if (log.w > lastEntry) lastEntry = log.w;
			if (log.t > longestRecord) longestRecord = log.t;
		});
	});

	let dayDifference = Math.floor(lastEntry / 86400000) - Math.floor(firstEntry / 86400000);
	dayDifference = dayDifference == 0 ? 1 : dayDifference;

	const average = Math.floor(playTime / dayDifference);

	const fields = [
		{ name: "Record Range", value: `${dayDifference} Days`, inline: true },
		{ name: "Total Playtime", value: await makeTimestamp(playTime, true), inline: true },
		{ name: "Playtime/Day", value: await makeTimestamp(average, false), inline: true },
		{
			name: "First Record",
			value: `<t:${Math.floor(firstEntry / 1000)}> ⁘ <t:${Math.floor(firstEntry / 1000)}:R>`,
			inline: true,
		},
		{
			name: "Last Record",
			value: `<t:${Math.floor(lastEntry / 1000)}> ⁘ <t:${Math.floor(lastEntry / 1000)}:R>`,
			inline: true,
		},
		{ name: "Longest Record", value: await makeTimestamp(longestRecord, false), inline: true },
		{ name: "Total Records", value: `${totalRecords}`, inline: true },
	];

	return fields;
}

export async function makeTimestamp(ms: number, day: boolean): Promise<string> {
	let totalSeconds = ms / 1000;
	const days = Math.floor(totalSeconds / 86400);
	totalSeconds %= 86400;
	const hours = Math.floor(totalSeconds / 3600);
	totalSeconds %= 3600;
	const minute = Math.floor(totalSeconds / 60);
	const second = Math.floor(totalSeconds % 60);

	return `${days > 0 && day ? days + "day(s) " : ""}${hours > 0 ? hours + "hour(s) " : ""}${
		hours > 0 && minute > 0 ? ", " : " "
	}${minute > 0 ? minute + "minute(s) " : ""}${(hours > 0 || minute > 0) && second > 0 ? "and " : ""}${
		second > 0 ? second + "second(s) " : ""
	}`.trim();
}

export function splitId(id: string): [string, string] {
	const [user, ...gameParts] = id.split("-");
	const game = gameParts.join("-");
	return [user, game];
}
