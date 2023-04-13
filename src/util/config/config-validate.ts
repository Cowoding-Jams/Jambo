import { Guild } from "discord.js";
import { config } from "../../config";
import {
	channelExists,
	emojiExists,
	isNotEmpty,
	isValidHexColor,
	isValidURl,
	roleExists,
} from "../misc/verify";

export async function validateConfigParameters(guild: Guild) {
	// URLs
	const urls = [config.iconURL, config.githubURL];
	urls
		.map((url) => ({ url, valid: isValidURl(url) }))
		.forEach((url) => {
			if (!url.valid) throw new Error(`iconURL || githubURL: ${url} is not a valid URL`);
		});

	// Colors
	const colors = [config.color, ...config.colorRoles.map((role) => role[1])];
	colors
		.map((color) => ({ color, valid: isValidHexColor(color as string) }))
		.forEach((color) => {
			if (!color.valid) throw new Error(`color || colorRoles: ${color} is not a valid Color`);
		});

	// Strings
	const str = [config.botName, config.serverDescription, config.jamRoleName];
	str.push(...config.colorRoles.map((role) => role[0]));
	str.push(...config.pronounRoles.map((role) => role[0]));
	str
		.map((string) => ({ string, valid: isNotEmpty(string) }))
		.forEach((string) => {
			if (!string.valid)
				throw new Error(
					`botName || serverDescription || jamRoleName || colorRoles || pronounRoles: ${
						string.string || "[empty string]"
					} is not a valid String`
				);
		});

	// Roles
	const roles = [config.adminRoleId, config.moderatorRoleId];
	roles
		.map((role) => ({ role, valid: roleExists(guild, role) }))
		.forEach(async (role) => {
			if (!(await role.valid))
				throw new Error(`adminRoleId || moderatorRoleId: ${role.role} is not a valid role ID`);
		});

	// Channels
	const channels = [config.jamChannelId, config.pollChannelId, config.resultCategoryId];
	channels
		.map((channel) => ({ channel, valid: channelExists(guild, channel) }))
		.forEach(async (channel) => {
			if (!(await channel.valid))
				throw new Error(
					`hamChannelId || pollChannelId || resultCategoryId: ${channel.channel} is not a valid channel/category`
				);
		});

	// Emojis
	const emojis = config.pronounRoles.map((role) => role[1]);
	emojis
		.map((emoji) => ({
			emoji,
			valid: typeof emoji === "string" ? emojiExists(guild, emoji) : emoji === null,
		}))
		.forEach(async (emoji) => {
			if (!(await emoji.valid)) throw new Error(`pronounRoles: ${emoji.emoji} is not a valid emoji`);
		});

	// Activity range
	const activityRange = config.activityLogRange;
	if (activityRange < 3 || activityRange > 10) {
		throw new Error(`activityLogRange: ${activityRange} is not in range of 3 to 10`);
	}
}
