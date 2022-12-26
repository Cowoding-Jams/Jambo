import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { birthdayDb } from "../../db";
import { addEmbedFooter } from "../misc/embeds";

export async function upcomingCommand(interaction: ChatInputCommandInteraction) {
	// I know there can be less loops, but cant matter that much
	// and Im to lazy to redo thing now...
	const entrys = birthdayDb.keyArray();

	let currentDate = new Date();
	currentDate = new Date(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), currentDate.getUTCDate());

	let results: { userid: string; date: Date }[] = [];

	entrys.forEach((userid) => {
		const entry = birthdayDb.get(userid);
		if (!entry) return;
		const entryDate = new Date(currentDate.getUTCFullYear(), entry.month - 1, entry.day);
		const dayDifference = (entryDate.getTime() - currentDate.getTime()) / 86400000;

		if (dayDifference <= 30 && dayDifference > 1) results.push({ userid, date: entryDate });
	});

	results = results
		.sort((a, b) => {
			return a.date.getTime() - b.date.getTime();
		})
		.slice(0, 10);

	const list: string[] = [];

	results.forEach((entry) => {
		list.push(`<@!${entry.userid}> ⁘ <t:${entry.date.getTime() / 1000}:D>`);
	});

	if (list.length == 0) {
		const embed = new EmbedBuilder()
			.setTitle("No upcoming birthdays")
			.setDescription("Seems like there are no upcoming birthdays in the next 30 days...");
		await interaction.editReply({ embeds: [addEmbedFooter(embed)] });
		return;
	}

	const embed = new EmbedBuilder().setTitle("Upcoming birthdays").setDescription(list.join("\n"));
	await interaction.editReply({ embeds: [addEmbedFooter(embed)] });
}
