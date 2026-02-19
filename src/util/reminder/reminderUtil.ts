import { Client, EmbedBuilder, SendableChannels, userMention } from "discord.js";
import { Duration } from "luxon";
import { reminderDb, reminderTimeoutCache } from "../../db.js";
import { addEmbedColor } from "../misc/embeds.js";
import { getUserOrRole } from "../misc/user.js";

export async function elapse(client: Client, id: string): Promise<void> {
	const reminder = reminderDb.get(id);
	if (!reminder) return;
	const channel = (await client.channels.fetch(reminder.channelID)) as SendableChannels;

	const ping = reminder.ping ? await getUserOrRole(reminder.ping, client.guilds.cache.first()!) : null;

	await channel?.send({
		content: `${userMention(reminder.user)} ${ping?.toString() || ""}`,
		embeds: [
			addEmbedColor(
				new EmbedBuilder().setTitle("Time is up!").setDescription(reminder.message || "I believe in you!")
			),
		],
	});
	reminderDb.delete(id);
	reminderTimeoutCache.delete(id);
}

export function schedulerTick(client: Client) {
	reminderDb.forEach((reminder, id) => {
		const diffNow = reminder.timestamp.diffNow();
		if (!reminderTimeoutCache.has(id) && diffNow <= Duration.fromObject({ minutes: 30 })) {
			reminderTimeoutCache.set(
				id,
				setTimeout(() => elapse(client, id), diffNow.toMillis())
			);
		}
	});
}
