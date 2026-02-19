import { Activity, ActivityType, Presence } from "discord.js";
import { DateTime, Duration } from "luxon";
import { activityTrackerBlacklistDb, activityTrackerLogDb } from "../../db.js";

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
	activityTrackerLogDb.push(`${userid}-${name}`, {
		duration: Duration.fromMillis(timePlayed),
		date: DateTime.now(),
	});
}
