import { Presence } from "discord.js";
import { config } from "../config";
import { blacklistCheck, getChangedActivities, logTime } from "../util/activity-tracker/presence";

const userCache = new Map<string, Record<string, number>>();

export default async function presenceUpdate(oldPresence: Presence | null, newPresence: Presence) {
	if (!config.logActivity || newPresence.user?.bot) return;

	const { started, stopped } = await getChangedActivities(oldPresence, newPresence);
	if (!started.length && !stopped.length) return;
	const userid = newPresence.userId;

	started.forEach(async (activity) => {
		if (await blacklistCheck(userid, activity.name.toLowerCase())) return;
		userCache.set(userid, { ...userCache.get(userid), [activity.name]: Date.now() });
	});

	stopped.forEach(async (activity) => {
		const cachedUser = userCache.get(userid);
		if (!cachedUser) return;
		const start = cachedUser[activity.name];
		if (!start) return;
		delete cachedUser[activity.name];
		const timePlayed = Date.now() - start;
		if (timePlayed < 20000) return;

		if (await blacklistCheck(userid, activity.name.toLowerCase())) return;
		await logTime(userid, activity.name.toLowerCase(), timePlayed);
	});
}
