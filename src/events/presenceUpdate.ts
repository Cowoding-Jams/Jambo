import { Presence } from "discord.js";
import { getChangedActivities, isBlacklisted, logIt } from "../util/tracker/presence";
import { config } from "../config";

const userCache = new Map<string, Record<string, number>>();

export default async function presenceUpdate(oldPresence: Presence | null, newPresence: Presence) {
	if (!config.tracking || newPresence.user?.bot) return;

	const { started, stopped } = await getChangedActivities(oldPresence, newPresence);
	if (!started.length && !stopped.length) return;
	const userID = newPresence.userId;

	started.forEach(async (activity) => {
		if (isBlacklisted(activity.name)) return;
		userCache.set(userID, { ...userCache.get(userID), [activity.name]: Date.now() });
	});

	stopped.forEach(async (activity) => {
		const cachedUser = userCache.get(userID);
		if (!cachedUser) return;
		const start = cachedUser[activity.name];
		if (!start) return;
		delete cachedUser[activity.name];

		// Played time in secods ("~~" makes float to int)
		const timePlayed = ~~(Date.now() - start);

		await logIt(activity.name, userID, timePlayed);
	});
}
