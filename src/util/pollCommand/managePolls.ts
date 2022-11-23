import { ChatInputCommandInteraction } from "discord.js";

export async function newPoll(interaction: ChatInputCommandInteraction) {
	const name = interaction.options.getString("name");

	interaction.reply({ content: `${name} created!`, ephemeral: true });
}

export async function editPoll(interaction: ChatInputCommandInteraction) {
	const name = interaction.options.getString("name");

	interaction.reply({ content: `${name} edited!`, ephemeral: true });
}

export async function deletePoll(interaction: ChatInputCommandInteraction) {
	const name = interaction.options.getString("name");

	interaction.reply({ content: `${name} deleted!`, ephemeral: true });
}
