import { hasRoleMentionPerms } from "../misc/permissions";
import { ChatInputCommandInteraction, EmbedBuilder, GuildMember, inlineCode, Role } from "discord.js";
import { reminderDb, reminderTimeoutCache } from "../../db";
import { addEmbedColor } from "../misc/embeds";
import { msToReadable } from "../misc/time";
import { elapse } from "./reminderUtil";
import { DateTime, Duration } from "luxon";

export async function reminderSet(interaction: ChatInputCommandInteraction) {
	const minutes = interaction.options.getInteger("minutes") || 0;
	const hours = interaction.options.getInteger("hours") || 0;
	const days = interaction.options.getInteger("days") || 0;
	const months = interaction.options.getInteger("months") || 0;
	const dateIsoString = interaction.options.getString("date-iso")?.toUpperCase();
	const dateIso = dateIsoString ? DateTime.fromISO(dateIsoString) : undefined;
	const dateUnixString = interaction.options.getString("date-unix");
	const dateUnix = dateUnixString ? DateTime.fromSeconds(parseInt(dateUnixString)) : undefined;

	const message = interaction.options.getString("message") || "";
	const additionalPing = interaction.options.getMentionable("additional-ping") as GuildMember | Role | null;

	const duration =
		months + days + hours + minutes == 0
			? Duration.fromObject({ minutes: 30 })
			: Duration.fromObject({
					minutes: minutes,
					hours: hours,
					days: days,
					months: months,
			  });

	const timestamp = dateUnix ?? dateIso ?? DateTime.now().plus(duration);

	if (timestamp <= DateTime.now()) {
		await interaction.reply({
			content: "Dummy... The timestamp must be in the future.",
			ephemeral: true,
		});
		return;
	}

	if (additionalPing instanceof Role && !(await hasRoleMentionPerms(interaction, additionalPing))) {
		await interaction.reply({
			content: "You don't have the permission to ping that role.",
			ephemeral: true,
		});
		return;
	}

	if (!interaction.channel) {
		await interaction.reply({
			content: "You can only use this command in a text channel.",
			ephemeral: true,
		});
		return;
	}

	const member = await interaction.guild!.members.fetch(interaction.user);

	const id = reminderDb.autonum;
	reminderDb.set(id, {
		timestamp: timestamp.toISO(),
		message: message,
		channelID: interaction.channel.id,
		user: member?.toString(),
		ping: additionalPing?.toString() ?? null,
	});

	if (timestamp.diffNow() <= Duration.fromObject({ minutes: 30 })) {
		reminderTimeoutCache.set(
			id,
			setTimeout(() => elapse(interaction.client, id), timestamp.diffNow().toMillis())
		);
	}

	const durationString = msToReadable(timestamp.diffNow().toMillis(), false);
	const timestampString =
		timestamp.diffNow() > Duration.fromObject({ hours: 1 })
			? timestamp.toFormat("dd.MM.yyyy HH:mm:ss 'UTC'Z")
			: timestamp.toFormat("HH:mm:ss 'UTC'Z");

	await interaction.reply({
		embeds: [
			addEmbedColor(
				new EmbedBuilder()
					.setTitle("Reminder set!")
					.setDescription(
						`I will remind you${
							additionalPing ? " and " + additionalPing.toString() : ""
						} in ${durationString}! (${timestampString})${
							message == ""
								? ""
								: `\nYour message to yourself${
										additionalPing ? " and " + additionalPing.toString() : ""
								  }: ${message}`
						} \nYou can always delete this reminder with ${inlineCode(`/reminder delete ${id}`)}`
					),
				true
			),
		],
	});
}

export async function reminderDelete(interaction: ChatInputCommandInteraction) {
	const c_id = interaction.options.getInteger("id", true);
	const member = await interaction.guild!.members.fetch(interaction.user);

	const item = reminderDb.get(c_id);
	if (!item) {
		await interaction.reply({ content: "The id does not exist.", ephemeral: true });
		return;
	}

	if (member.toString() === item.user) {
		reminderDb.delete(c_id);
		if (reminderTimeoutCache.has(c_id)) {
			clearTimeout(reminderTimeoutCache.get(c_id));
			reminderTimeoutCache.delete(c_id);
		}
		await interaction.reply({ content: "I've removed the reminder :)", ephemeral: true });
	} else {
		await interaction.reply({ content: "You can only delete your own reminders.", ephemeral: true });
	}
}

export async function reminderList(interaction: ChatInputCommandInteraction) {
	const member = await interaction.guild!.members.fetch(interaction.user);
	let output = "";

	reminderDb.forEach((value, key) => {
		if (value.user === member.toString()) {
			output += `ID: ${key} - <t:${DateTime.fromISO(value.timestamp).toSeconds()}:R> ${
				value.ping ? `- ${value.ping} -` : "-"
			} ${value.message == "" ? "No message." : `${value.message}`}\n`;
		}
	});

	if (output == "") {
		await interaction.reply({
			content: "The list is empty. You don't have any active reminders.",
			ephemeral: true,
		});
	} else {
		await interaction.reply({
			embeds: [addEmbedColor(new EmbedBuilder().setTitle("Your reminders").setDescription(output))],
			ephemeral: true,
		});
	}
}
