import { hasRoleMentionPerms } from "../misc/permissions";
import { ChatInputCommandInteraction, EmbedBuilder, GuildMember, inlineCode, Role } from "discord.js";
import { reminderDb, reminderTimeoutCache } from "../../db";
import { addDefaultEmbedFooter } from "../misc/embeds";
import { msToReadable } from "../misc/time";
import { elapse } from "./reminderUtil";

export async function reminderSet(interaction: ChatInputCommandInteraction) {
	const minutes = interaction.options.getInteger("minutes") || 0;
	const hours = interaction.options.getInteger("hours") || 0;
	const days = interaction.options.getInteger("days") || 0;
	const months = interaction.options.getInteger("months") || 0;
	const dateIsoString = interaction.options.getString("date-iso") || "error";
	const dateIso = Date.parse(dateIsoString);
	const dateUnixString = interaction.options.getString("date-unix") || "error";
	const dateUnix = new Date(parseInt(dateUnixString) * 1000).getTime();

	if ((dateIsoString != "error" && !dateIso) || (dateUnixString != "error" && !dateUnix)) {
		await interaction.reply({
			content:
				"Couldn't interpret that date. Invalid date format... Please use the ISO 8601 or an Unix timestamp.",
			ephemeral: true,
		});
		return;
	}

	const message = interaction.options.getString("message") || "";
	const additionalPing = interaction.options.getMentionable("additional-ping") as GuildMember | Role | null;

	let milliseconds =
		(minutes + 60 * hours + 60 * 24 * days + 60 * 24 * 30 * months) * 1000 * 60 || 20 * 60 * 1000; // defaults to 20 minutes
	let timestamp: number;

	if (dateIso) {
		timestamp = dateIso;
		milliseconds = timestamp - Date.now();
	} else if (dateUnix) {
		timestamp = dateUnix;
		milliseconds = timestamp - Date.now();
	} else {
		timestamp = Date.now() + milliseconds;
	}

	if (timestamp <= Date.now()) {
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
		timestamp: timestamp,
		message: message,
		channelID: interaction.channel.id,
		pings: [member?.toString(), additionalPing?.toString() ?? ""],
	});

	if (timestamp <= Date.now() + 30 * 60 * 1000)
		reminderTimeoutCache.set(
			id,
			setTimeout(() => elapse(interaction.client, id), timestamp - Date.now())
		);

	await interaction.reply({
		embeds: [
			addDefaultEmbedFooter(
				new EmbedBuilder()
					.setTitle("Reminder set!")
					.setDescription(
						`I will remind you${additionalPing ? " and " + additionalPing.toString() : ""} in ${msToReadable(
							milliseconds
						)}!${
							message == ""
								? ""
								: `\nYour message to yourself${
										additionalPing ? " and " + additionalPing.toString() : ""
								  }: ${message}`
						} \nYou can always delete this reminder with ${inlineCode(`/reminder delete ${id}`)}`
					)
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

	if (member.toString() === item.pings[0]) {
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
		const time = (value.timestamp / 1000).toFixed(0);

		if (value.pings[0] === member.toString()) {
			output += `ID: ${key} - <t:${time}:R> - ${value.pings.join(" ")} - ${
				value.message == "" ? "No message." : `${value.message}`
			}\n`;
		}
	});

	if (output == "") {
		await interaction.reply({
			content: "The list is empty. You don't have any active reminders.",
			ephemeral: true,
		});
	} else {
		await interaction.reply({
			embeds: [addDefaultEmbedFooter(new EmbedBuilder().setTitle("Your reminders").setDescription(output))],
			ephemeral: true,
		});
	}
}
