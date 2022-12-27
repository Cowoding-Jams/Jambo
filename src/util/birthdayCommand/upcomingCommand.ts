import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { birthdayDb } from "../../db";
import { addEmbedColor } from "../misc/embeds";
import { DateTime } from "luxon";
import { longDateFormatWithTimezone } from "../misc/time";

export async function upcomingCommand(interaction: ChatInputCommandInteraction) {
	const now = DateTime.now();
	const entries = birthdayDb
		.map((d, key) => ({ user: key, date: d.set({ year: now.year }) }))
		.filter((d) => d.date > now && d.date.diffNow().as("days") <= 30);

	const answer = entries.map(
		(entry) => `<@${entry.user}> ⁘ ${entry.date.toFormat(longDateFormatWithTimezone)}`
	);

	if (entries.length == 0) {
		const embed = new EmbedBuilder()
			.setTitle("No upcoming birthdays")
			.setDescription("Seems like there are no upcoming birthdays in the next 30 days...");
		await interaction.reply({ embeds: [addEmbedColor(embed)] });
		return;
	}

	const embed = new EmbedBuilder()
		.setTitle("Upcoming birthdays")
		.setDescription(answer.join("\n").slice(0, 4096));
	await interaction.reply({ embeds: [addEmbedColor(embed)] });
}
