import { CommandInteraction, EmbedBuilder } from "discord.js";
import { jamDb, pollDb } from "../../db";
import { addEmbedFooter } from "../misc/embeds";
import { discordTimestamp } from "../misc/time";

export async function listJams(interaction: CommandInteraction) {
	const jams = jamDb.array();

	if (jams.length === 0) {
		await interaction.reply({ content: "No jams registered yet...", ephemeral: true });
		return;
	}

	jams.sort((a, b) => (a.start < b.start ? -1 : 1));

	const embed = new EmbedBuilder().setTitle("Coding Jams").setDescription(
		`List of all jams sorted by start date\n\n${jams
			.map((j) => `${discordTimestamp(j.start)} - ${j.title}`)
			.join("\n")
			.slice(0, 4090)}`
	);

	await interaction.reply({ embeds: [addEmbedFooter(embed)], ephemeral: true });
}

export async function listPolls(interaction: CommandInteraction) {
	const polls = pollDb.array();

	if (polls.length === 0) {
		await interaction.reply({ content: "No polls registered yet...", ephemeral: true });
		return;
	}

	polls.sort((a, b) => (a.start < b.start ? -1 : 1));

	const embed = new EmbedBuilder().setTitle("Polls").setDescription(
		`List of all jams sorted by start date\n\n${polls
			.map((j) => `${discordTimestamp(j.start)} - ${j.title}`)
			.join("\n")
			.slice(0, 4090)}`
	);

	await interaction.reply({ embeds: [addEmbedFooter(embed)], ephemeral: true });
}
