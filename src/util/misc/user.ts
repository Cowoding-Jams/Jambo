import { Guild, GuildMember, Role } from "discord.js";

export async function getUserOrRole(id: string, guild: Guild): Promise<GuildMember | Role | null> {
	const role = await guild.roles.fetch(id);
	const member = await guild.members.fetch(id).catch(() => null);
	return role || member;
}

export async function getUsernameOrRolename(id: string, guild: Guild): Promise<string | null> {
	const role = await guild.roles.fetch(id);
	const member = await guild.members.fetch(id).catch(() => null);
	return role?.name || member?.user.tag || null;
}
