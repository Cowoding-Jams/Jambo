import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	Channel,
	EmbedBuilder,
	Presence,
	TextChannel,
} from "discord.js";
import { addDefaultEmbedFooter } from "../util/misc/embeds";
import { config } from "../config";
import { getStopedActivities, blacklistCheck, logTime, msToTimeString } from "../util/tracker/presence";

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

		if (await blacklistCheck(userid, element.name)) return;

		await logTime(userid, element.name, timePlayed);

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
