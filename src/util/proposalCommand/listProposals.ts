import { ChatInputCommandInteraction } from "discord.js";

export async function listProposals(interaction: ChatInputCommandInteraction): Promise<void> {
	await interaction.reply({ content: "This command is not yet implemented.", ephemeral: true });
}
