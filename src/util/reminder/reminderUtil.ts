import { addEmbedColor } from "../misc/embeds";
import { reminderDb, reminderTimeoutCache } from "../../db";
import { Client, EmbedBuilder, TextBasedChannel } from "discord.js";
import { Duration } from "luxon";

export async function elapse(client: Client, id: string): Promise<void> {
	const reminder = reminderDb.get(id);
	if (!reminder) return;
	const channel = (await client.channels.fetch(reminder.channelID)) as TextBasedChannel;

	await channel?.send({
		content: `${reminder.user} ${reminder.ping || ""}`,
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
