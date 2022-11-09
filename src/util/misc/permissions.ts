import { ChatInputCommandInteraction, GuildMember, Role } from "discord.js";

export async function hasRoleMentionPerms(
	interaction: ChatInputCommandInteraction,
	mentionable: Role | null
): Promise<boolean> {
	const member = await interaction.guild?.members.fetch(interaction.user);
	return member?.permissions.has("MentionEveryone") || mentionable?.mentionable || false;
}

export async function hasAdminPerms(interaction: ChatInputCommandInteraction): Promise<boolean> {
	const member = await interaction.guild?.members.fetch(interaction.user);
	return member?.permissions.has("Administrator") || false;
}

export async function hasRole(member: GuildMember | null, roleID: string): Promise<boolean> {
	return member?.roles.cache.has(roleID) || false;
}
