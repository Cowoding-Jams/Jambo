import { Guild, GuildMember } from "discord.js";

export function search(user: GuildMember, find: string, useStartsWith = true) {
	const check = (role: string) => (useStartsWith ? role.startsWith(find) : role == find);
	return Array.from(user.roles.cache.filter((role) => check(role.name)).values());
}

/** Returns the first role that starts with UTC or null */
export async function getTimezonefromRole(userID: string, guild: Guild) {
	const user = await guild.members.fetch(userID);
	const found = search(user, "UTC");
	if (found.length == 0) return null;
	return found[0];
}

export const timezoneRoles = [
	"UTC-12",
	"UTC-11",
	"UTC-10",
	"UTC-9",
	"UTC-8",
	"UTC-7",
	"UTC-6",
	"UTC-5",
	"UTC-4",
	"UTC-3",
	"UTC-2",
	"UTC-1",
	"UTC",
	"UTC+1",
	"UTC+2",
	"UTC+3",
	"UTC+4",
	"UTC+5",
	"UTC+6",
	"UTC+7",
	"UTC+8",
	"UTC+9",
	"UTC+10",
	"UTC+11",
	"UTC+12",
];
