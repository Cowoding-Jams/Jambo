import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { birthdayDb } from "../../db";
import { addDefaultEmbedFooter } from "../misc/embeds";

export async function upcomingCommand(interaction: ChatInputCommandInteraction) {
	// I know there can be less loops, but cant matter that much
	// and Im to lazy to redo thing now...
	const entrys = birthdayDb.keyArray();

	let currentDate = new Date();
	currentDate = new Date(
		currentDate.getUTCFullYear(),
		currentDate.getUTCMonth(),
		currentDate.getUTCDate(),
		0,
		0,
		0,
		0
	);

	let results: string[] = [];

	entrys.forEach((userid) => {
		const entry = birthdayDb.get(userid);
		if (!entry) return;
		const entryDate = new Date(currentDate.getUTCFullYear(), entry.month - 1, entry.day, 0, 0, 0, 0);

		if (entry.month < currentDate.getUTCMonth()) return;
		if (entry.day < currentDate.getUTCDate()) return;

		const dayDifference = (currentDate.getTime() - entryDate.getTime()) / 86400000;

		if (dayDifference <= 30 && dayDifference < 1) results.push(userid);
	});

	results = results
		.sort((a, b) => {
			const ea = birthdayDb.get(a);
			const eb = birthdayDb.get(b);
			return (ea?.day || 1) + (ea?.month || 1) * 31 - ((eb?.day || 1) + (ea?.month || 1) * 31);
		})
		.slice(0, 10);

	const list: string[] = [];

	results.forEach((userid) => {
		const entry = birthdayDb.get(userid);
		if (!entry) return;
		const entryDate = new Date(currentDate.getUTCFullYear(), entry.month - 1, entry.day, 0, 0, 0, 0);
		list.push(`<@!${userid}> ⁘ <t:${entryDate.getTime() / 1000}:D>`);
	});

	if (list.length == 0) {
		let embed = new EmbedBuilder()
			.setTitle("No upcoming Birthdays")
			.setDescription("Seems like there are no upcoming birthdays in the next 30 days");
		embed = addDefaultEmbedFooter(embed);
		await interaction.editReply({ embeds: [embed] });
		return;
	}

	let embed = new EmbedBuilder().setTitle("Upcoming Birthdays").setDescription(list.join("\n"));
	embed = addDefaultEmbedFooter(embed);
	await interaction.editReply({ embeds: [embed] });
}
