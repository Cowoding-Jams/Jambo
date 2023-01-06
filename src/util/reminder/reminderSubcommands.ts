import { hasModeratorRole, hasRoleMentionPerms } from "../misc/permissions";
import { ChatInputCommandInteraction, EmbedBuilder, GuildMember, inlineCode, Role } from "discord.js";
import { reminderDb, reminderTimeoutCache } from "../../db";
import { addEmbedColor } from "../misc/embeds";
import { checkDate, checkDuration, discordRelativeTimestamp } from "../misc/time";
import { elapse } from "./reminderUtil";
import { DateTime, Duration } from "luxon";

export async function reminderSet(interaction: ChatInputCommandInteraction) {
	const message = interaction.options.getString("message") || "";
	const additionalPing = interaction.options.getMentionable("additional-ping") as GuildMember | Role | null;

	const minutes = interaction.options.getInteger("minutes") || 0;
	const hours = interaction.options.getInteger("hours") || 0;
	const dateIsoString = interaction.options.getString("date-iso");
	const durationIsoString = interaction.options.getString("duration-iso");

	const inputs = `- Message: ${message}\n- Additional ping: ${additionalPing?.toString() || ""}`;
	const dateIso = await checkDate(interaction, dateIsoString, inputs);
	const durationIso = await checkDuration(interaction, durationIsoString, inputs);

	const duration =
		hours + minutes == 0
			? Duration.fromObject({ minutes: 30 })
			: Duration.fromObject({
					minutes: minutes,
					hours: hours,
			  });

	const timestamp = dateIso
		? dateIso
		: durationIso
		? DateTime.now().plus(durationIso)
		: DateTime.now().plus(duration);

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

	const id = reminderDb.autonum as string;

	reminderDb.set(id, {
		timestamp: timestamp,
		message: message,
		channelID: interaction.channel.id,
		user: member.id,
		ping: additionalPing?.id ?? null,
	});

	if (timestamp.diffNow() <= Duration.fromObject({ minutes: 30 })) {
		reminderTimeoutCache.set(
			id,
			setTimeout(() => elapse(interaction.client, id), timestamp.diffNow().toMillis())
		);
	}

	const embed = new EmbedBuilder()
		.setTitle("Reminder set!")
		.setDescription(
			`I will remind you ${discordRelativeTimestamp(timestamp)}! (${inlineCode(`ID: ${id}`)})${
				additionalPing ? `\n(You and ${additionalPing.toString()})` : ""
			}`
		);

	if (message !== "") {
		embed.addFields({
			name: `Message`,
			value: message,
		});
	}

	await interaction.reply({
		embeds: [addEmbedColor(embed)],
	});
}

export async function reminderDelete(interaction: ChatInputCommandInteraction) {
	const c_id = interaction.options.getInteger("id", true).toString();
	const member = await interaction.guild!.members.fetch(interaction.user);

	const item = reminderDb.get(c_id);
	if (!item) {
		await interaction.reply({
			content: "The id does not exist.",
			ephemeral: true,
		});
		return;
	}

	if (member.toString() === item.user || (await hasModeratorRole(interaction))) {
		reminderDb.delete(c_id);
		if (reminderTimeoutCache.has(c_id)) {
			clearTimeout(reminderTimeoutCache.get(c_id));
			reminderTimeoutCache.delete(c_id);
		}
		await interaction.reply({
			content: "I've removed the reminder :)",
			ephemeral: true,
		});
	} else {
		await interaction.reply({
			content: "You can only delete your own reminders.",
			ephemeral: true,
		});
	}
}

export async function reminderList(interaction: ChatInputCommandInteraction) {
	const member = await interaction.guild!.members.fetch(interaction.user);
	let output = "";

	reminderDb.forEach((value, key) => {
		if (value.user === member.toString()) {
			output += `ID: ${key} - ${discordRelativeTimestamp(value.timestamp)} ${
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
