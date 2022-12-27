import { ChatInputCommandInteraction, inlineCode } from "discord.js";
import { birthdayDb } from "../../db";
import { DateTime } from "luxon";
import { getTimezonefromRole } from "../misc/role";
import { longDateFormatWithTimezone } from "../misc/time";
import { config } from "../../config";

export async function setBirthday(interaction: ChatInputCommandInteraction) {
	const oldDate = birthdayDb.get(interaction.user.id);
	const dateString = interaction.options.getString("date")!;
	let date = DateTime.fromISO(dateString, { setZone: true });

	if (interaction.options.getBoolean("delete")) {
		birthdayDb.delete(interaction.user.id);
		await interaction.reply({
			content: `Your birthday is now removed from the database!`,
		});
		return;
	}

	if (!date || !date.isValid) {
		await interaction.reply({
			content: `${inlineCode(dateString)} is not a valid date... Please enter a valid ISO string!`,
			ephemeral: true,
		});
		return;
	}

	if (date > DateTime.now()) {
		await interaction.reply({
			content: `You can't set your birthday in the future!`,
			ephemeral: true,
		});
		return;
	}

	const zone = await getTimezonefromRole(interaction.user.id, interaction.guild!);
	if (zone) date = date.setZone(zone.name);

	birthdayDb.set(
		interaction.user.id,
		date.set({
			hour: config.birthdayNotificationAt,
			minute: 0,
			second: 0,
			millisecond: 0,
		})
	);

	if (oldDate) {
		await interaction.reply({
			content: `Changed your birthday from *${oldDate.toFormat(
				longDateFormatWithTimezone
			)}* to **${date.toFormat(longDateFormatWithTimezone)}**!`,
		});
	} else {
		await interaction.reply({
			content: `Set your birthday to **${date.toFormat(longDateFormatWithTimezone)}**!`,
		});
	}
}

export async function myBirthday(interaction: ChatInputCommandInteraction) {
	if (!birthdayDb.has(interaction.user.id)) {
		await interaction.reply({
			content: "You haven't set your birthday yet!\nYou can do this by using `/birthday set`",
			ephemeral: true,
		});
		return;
	}

	const date = birthdayDb.get(interaction.user.id)!;

	await interaction.reply({
		content: `Your birthday is set for the **${date.toFormat(longDateFormatWithTimezone)}**!`,
	});
}
