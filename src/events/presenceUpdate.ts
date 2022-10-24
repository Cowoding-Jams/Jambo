import { Presence } from "discord.js";
import { config } from "../config";
import { blacklistCheck, getStopedActivities, logTime } from "../util/tracker/presence";

export default async function presenceUpdate(oldPresence: Presence | null, newPresence: Presence) {
	if (!config.logActivity) return;

	const stopedActivities = await getStopedActivities(oldPresence, newPresence);
	if (stopedActivities.length == 0) return;

	const userid = newPresence.userId;

	stopedActivities.forEach(async (element) => {
		const start = element.createdTimestamp;
		const timePlayed = Date.now() - start;
		if (timePlayed < 20000) return;

		if (await blacklistCheck(userid, element.name.toLowerCase())) return;

		await logTime(userid, element.name.toLowerCase(), timePlayed);
	});
}
