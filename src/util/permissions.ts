import { ChatInputCommandInteraction } from "discord.js";

export async function hasMentionEveryonePerms(interaction: ChatInputCommandInteraction): Promise<boolean> {
	const member = await interaction.guild?.members.fetch(interaction.user);
	if (!member?.permissions.has("MentionEveryone")) {
		await interaction.reply({ content: "You don't have the permission to ping everyone.", ephemeral: true });
		return false;
	}
	return true;
}

export async function hasAdminPerms(interaction: ChatInputCommandInteraction): Promise<boolean> {
	const member = await interaction.guild?.members.fetch(interaction.user);
	if (!member?.permissions.has("Administrator")) {
		await interaction.reply({ content: "You don't have the admin permission to use that command.", ephemeral: true });
		return false;
	}
	return true;
}
