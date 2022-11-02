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

export async function logTime(userid: string, elementName: string, timePlayed: number): Promise<void> {
	const name = elementName.replace(/[^\x20-\x7F]/g, "").trim();
	if (name.length == 0) return;
	if (!activityTrackerLogDb.has(`${userid}-${name}`)) activityTrackerLogDb.set(`${userid}-${name}`, []);
	activityTrackerLogDb.push(`${userid}-${name}`, { t: timePlayed, w: Date.now() });
}
