import { ChatInputCommandInteraction } from "discord.js";

export async function newJam(interaction: ChatInputCommandInteraction) {
	const name = interaction.options.getString("name");

	interaction.reply({ content: `${name} created!`, ephemeral: true });
}

export async function editJam(interaction: ChatInputCommandInteraction) {
	const name = interaction.options.getString("name");

	interaction.reply({ content: `${name} edited!`, ephemeral: true });
}

export async function deleteJam(interaction: ChatInputCommandInteraction) {
	const name = interaction.options.getString("name");

	interaction.reply({ content: `${name} deleted!`, ephemeral: true });
}
