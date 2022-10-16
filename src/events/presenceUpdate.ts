import {
	ActionRowBuilder,
	Activity,
	ButtonBuilder,
	ButtonStyle,
	Channel,
	EmbedBuilder,
	Presence,
	TextChannel,
} from "discord.js";
import { activityTrackerBlacklistDb, activityTrackerLogDb } from "../db";
import { addDefaultEmbedFooter } from "../util/misc/embeds";
import { config } from "../config";

export default async function presenceUpdate(oldPresence: Presence | null, newPresence: Presence) {
	if (!config.logActivity) return;

	const stopedActivities = await getStopedActivities(oldPresence, newPresence);
	if (stopedActivities.length == 0) return;

	const channel: Channel | null = await newPresence.client.channels.fetch(config.logChannel);
	if (channel == null) return;

	const userid = newPresence.userId;

	stopedActivities.forEach(async (element) => {
		const start = element.createdTimestamp;
		const timePlayed = Date.now() - start;
		if (timePlayed < 20000) return;

		await logTime(userid, element.name, timePlayed);

		if (await blacklistCheck(userid, element.name)) return;

		let embed = new EmbedBuilder()
			.setTitle("Game Activity log")
			.setDescription(
				`<@!${userid}> just played \`${element.name}\` for \`${await msToTimeString(timePlayed)}\``
			);
		embed = addDefaultEmbedFooter(embed);

		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder().setCustomId(`delete.${userid}`).setLabel("🗑️").setStyle(ButtonStyle.Danger)
		);

		await (channel as TextChannel)?.send({ embeds: [embed], components: [row] });
	});
}

async function getStopedActivities(oldPresence: Presence | null, newPresence: Presence): Promise<Activity[]> {
	// 0 = game activity
	const oldActivities = oldPresence?.activities.filter((value) => value.type === 0);
	const newActivities = newPresence.activities.filter((value) => value.type === 0);

	const stopedActivities: Activity[] = [];
	oldActivities?.forEach((element) => {
		if (!newActivities.some((e) => e.name === element.name)) stopedActivities.push(element);
	});

	return stopedActivities;
}

async function blacklistCheck(userid: string, elementName: string): Promise<boolean> {
	if (activityTrackerBlacklistDb.get("general-user")?.includes(userid)) return true;
	if (activityTrackerBlacklistDb.get("general-game")?.includes(elementName)) return true;
	if (activityTrackerBlacklistDb.has(userid)) {
		if (activityTrackerBlacklistDb.get(userid)?.includes(elementName)) return true;
	}
	return false;
}

async function msToTimeString(ms: number): Promise<string> {
	let totalSeconds = ms / 1000;
	totalSeconds %= 86400;
	const hours = Math.floor(totalSeconds / 3600);
	totalSeconds %= 3600;
	const minute = Math.floor(totalSeconds / 60);
	const seconds = Math.floor(totalSeconds % 60);

	return `${hours} hour(s), ${minute} minute(s) and ${seconds} second(s)`;
}

async function logTime(userid: string, elementName: string, timePlayed: number): Promise<void> {
	if (!activityTrackerLogDb.has(`${userid}-${elementName}`))
		activityTrackerLogDb.set(`${userid}-${elementName}`, []);
	activityTrackerLogDb.push(`${userid}-${elementName}`, { t: timePlayed, w: Date.now() });
}
