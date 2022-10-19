import { addDefaultEmbedFooter } from "../misc/embeds";
import { reminderDb, reminderTimeoutCache } from "../../db";
import { logger } from "../../logger";
import { Client, EmbedBuilder, TextBasedChannel } from "discord.js";

export async function elapse(client: Client, id: number): Promise<void> {
	const reminder = reminderDb.get(id);
	if (!reminder) return;
	const channel = (await client.channels.fetch(reminder.channelID)) as TextBasedChannel;
	await channel?.send({
		content: reminder.pings.join(" "),
		embeds: [
			addDefaultEmbedFooter(
				new EmbedBuilder().setTitle("Time is up!").setDescription(reminder.message || "I believe in you!")
			),
		],
	});
	reminderDb.delete(id);
	reminderTimeoutCache.delete(id);
}

export function schedulerTick(client: Client) {
	try {
		reminderDb.forEach((reminder, id) => {
			if (!reminderTimeoutCache.has(id) && reminder.timestamp <= Date.now() + 30 * 60 * 1000) {
				reminderTimeoutCache.set(
					id,
					setTimeout(() => elapse(client, id), reminder.timestamp - Date.now())
				);
			}
		});
	} catch (e) {
		logger.error("Error in reminder scheduler tick", e);
	}
}

export function timestampToReadable(milliseconds: number, short = false): string {
	milliseconds /= 1000 * 60; // relative time in minutes
	const _months = Math.floor(milliseconds / (60 * 24 * 30));
	milliseconds = milliseconds % (60 * 24 * 30);
	const _days = Math.floor(milliseconds / (60 * 24));
	milliseconds = milliseconds % (60 * 24);
	const _hours = Math.floor(milliseconds / 60);
	milliseconds = milliseconds % 60;
	const _minutes = Math.round(milliseconds * 100) / 100;

	if (short) {
		return `${_months == 0 ? "" : `${_months}m`}${_days == 0 ? "" : ` ${_days}d`}${
			_hours == 0 ? "" : ` ${_hours}h`
		}${_minutes == 0 ? "" : ` ${_minutes}min`}`;
	} else {
		return `${_months == 0 ? "" : `${_months} months`}${_days == 0 ? "" : ` ${_days} days`}${
			_hours == 0 ? "" : ` ${_hours} hours`
		}${_minutes == 0 ? "" : ` ${_minutes} minutes`}`;
	}
}
