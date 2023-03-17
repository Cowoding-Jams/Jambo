import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { birthdayDb } from "../../db";
import { addEmbedColor } from "../misc/embeds";
import { DateTime } from "luxon";
import { longDateFormatWithTimezone } from "../misc/time";

export async function upcomingCommand(interaction: ChatInputCommandInteraction) {
	const now = DateTime.now();
	const entries = birthdayDb
		.map((d, key) => ({
			user: key,
			date: d,
			dateThisYear: d.set({ year: now.year }),
			dateNextYear: d.set({ year: now.year + 1 }),
		}))
		.filter(
			(d) =>
				(d.dateThisYear > now && d.dateThisYear.diffNow().as("days") <= 30) ||
				(d.dateNextYear > now && d.dateNextYear.diffNow().as("days") <= 30)
		)
		.sort((a, b) => {
			const daysA = Math.min(a.dateThisYear.diffNow().as("days"), a.dateNextYear.diffNow().as("days"));
			const daysB = Math.min(b.dateThisYear.diffNow().as("days"), b.dateNextYear.diffNow().as("days"));
			return daysA - daysB;
		});

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
