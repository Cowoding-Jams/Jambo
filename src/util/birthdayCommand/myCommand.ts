import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { birthdayDb } from "../../db";
import { addDefaultEmbedFooter } from "../misc/embeds";

export async function myCommand(interaction: ChatInputCommandInteraction) {
	if (!birthdayDb.has(interaction.user.id)) {
		let embed = new EmbedBuilder()
			.setTitle("No birthday set")
			.setDescription("You didn't set your birthday yet!\nYou can do this by using `/birthday set`");
		embed = addDefaultEmbedFooter(embed);
		await interaction.editReply({ embeds: [embed] });
		return;
	}

	const entry = birthdayDb.get(interaction.user.id);
	const month = entry?.month;
	const day = entry?.day;

	let embed = new EmbedBuilder().setTitle(`Your Birthday is set for the \`${day}.${month}\``);
	embed = addDefaultEmbedFooter(embed);
	await interaction.editReply({ embeds: [embed] });
}
