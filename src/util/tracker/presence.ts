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

export function msToTimeString(ms: number) {
	let totalSeconds = ms / 1000;
	totalSeconds %= 86400;
	const hours = Math.floor(totalSeconds / 3600);
	totalSeconds %= 3600;
	const minute = Math.floor(totalSeconds / 60);
	const second = Math.floor(totalSeconds % 60);

	return `${hours > 0 ? hours + "hour(s)" : ""}${hours > 0 && minute > 0 ? ", " : " "}${
		minute > 0 ? minute + "minute(s)" : ""
	}${(hours > 0 || minute > 0) && second > 0 ? " and " : ""}${second > 0 ? second + "second(s)" : ""}`.trim();
}

export async function logTime(userid: string, elementName: string, timePlayed: number): Promise<void> {
	if (!activityTrackerLogDb.has(`${userid}-${elementName}`))
		activityTrackerLogDb.set(`${userid}-${elementName}`, []);
	activityTrackerLogDb.push(`${userid}-${elementName}`, { t: timePlayed, w: Date.now() });

}
