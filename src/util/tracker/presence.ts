import { Activity, Presence } from "discord.js";
import { activityTrackerBlacklistDb, activityTrackerLogDb } from "../../db";

export async function getStopedActivities(
	oldPresence: Presence | null,
	newPresence: Presence
): Promise<Activity[]> {
	// 0 = game activity
	const oldActivities = oldPresence?.activities.filter((value) => value.type === 0);
	const newActivities = newPresence.activities.filter((value) => value.type === 0);

	const stopedActivities: Activity[] = [];
	oldActivities?.forEach((element) => {
		if (!newActivities.some((e) => e.name === element.name)) stopedActivities.push(element);
	});

	return stopedActivities;
}

export async function blacklistCheck(userid: string, elementName: string): Promise<boolean> {
	if (activityTrackerBlacklistDb.get("general-user")?.includes(userid)) return true;
	if (activityTrackerBlacklistDb.get("general-game")?.includes(elementName)) return true;
	if (activityTrackerBlacklistDb.has(userid)) {
		if (activityTrackerBlacklistDb.get(userid)?.includes(elementName)) return true;
	}
	return false;
}

export function msToTimeString(ms: number, short: boolean) {
	let totalSeconds = ms / 1000;
	const days = Math.floor(totalSeconds / 86400);
	totalSeconds %= 86400;
	const hours = Math.floor(totalSeconds / 3600);
	totalSeconds %= 3600;
	const minute = Math.floor(totalSeconds / 60);
	const second = Math.floor(totalSeconds % 60);

	return `${days > 0 ? days + (short ? "d" : "days") : ""}${
		hours > 0 ? hours + (short ? "h" : "hour(s)") : ""
	}${hours > 0 && minute > 0 ? ", " : " "}${minute > 0 ? minute + (short ? "m" : "minute(s)") : ""}${
		(hours > 0 || minute > 0) && second > 0 ? " and " : ""
	}${second > 0 ? second + (short ? "s" : "second(s)") : ""}`.trim();
}

export async function logTime(userid: string, elementName: string, timePlayed: number): Promise<void> {
	const name = elementName.replace(/[^\x20-\x7F]/g, "").trim();
	if (name.length == 0) return;
	if (!activityTrackerLogDb.has(`${userid}-${name}`)) activityTrackerLogDb.set(`${userid}-${name}`, []);
	activityTrackerLogDb.push(`${userid}-${name}`, { t: timePlayed, w: Date.now() });
}
