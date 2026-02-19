import {
	AutocompleteInteraction,
	ButtonInteraction,
	ChatInputCommandInteraction,
	GuildMember,
	ModalSubmitInteraction,
	Role,
} from "discord.js";
import { config } from "../../config.js";

export async function hasRoleMentionPerms(
	interaction: ChatInputCommandInteraction,
	mentionable: Role | null
): Promise<boolean> {
	const member = await interaction.guild?.members.fetch(interaction.user);
	return member?.permissions.has("MentionEveryone") || mentionable?.mentionable || false;
}

export async function hasAdminPerms(
	interaction:
		| ChatInputCommandInteraction
		| ButtonInteraction
		| ModalSubmitInteraction
		| AutocompleteInteraction
): Promise<boolean> {
	const member = await interaction.guild?.members.fetch(interaction.user);
	return member?.permissions.has("Administrator") || false;
}

export async function hasAdminRole(
	interaction:
		| ChatInputCommandInteraction
		| ButtonInteraction
		| ModalSubmitInteraction
		| AutocompleteInteraction
): Promise<boolean> {
	const member = await interaction.guild?.members.fetch(interaction.user);
	return member?.roles.cache.has(config.adminRoleId) || (await hasAdminPerms(interaction));
}

export async function hasModeratorRole(
	interaction:
		| ChatInputCommandInteraction
		| ButtonInteraction
		| ModalSubmitInteraction
		| AutocompleteInteraction
): Promise<boolean> {
	const member = await interaction.guild?.members.fetch(interaction.user);
	return member?.roles.cache.has(config.moderatorRoleId) || (await hasAdminPerms(interaction));
}

export async function hasRole(member: GuildMember | null, roleID: string): Promise<boolean> {
	return member?.roles.cache.has(roleID) || false;
}
