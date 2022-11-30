import { Client, EmbedBuilder, Guild } from "discord.js";
import { config } from "../../config";
import { birthdayDb } from "../../db";
import { ctx } from "../../ctx";
import { addDefaultEmbedFooter } from "../misc/embeds";

export async function birthdayMessageTick(client: Client) {
	const timezone = getTimezoneForTargetHour(config.birthdayNotificationAt);
	const defaultGuild = await client.guilds.fetch(ctx.defaultGuild);
	await defaultGuild.members.fetch();
	const possibleUsers =
		getMembersWithTimeZone(
			`UTC${timezone > 0 ? "+" + timezone : timezone < 0 ? timezone : ""}`,
			defaultGuild
		) || [];
	if (timezone === 0) possibleUsers.push(...getMembersWithNoTimeZone(defaultGuild));
	const adjustedDate = new Date(Date.now() + timezone * 60 * 60 * 1000);
	const adjustedMonth = adjustedDate.getUTCMonth() + 1;
	const adjustedDay = adjustedDate.getUTCDate();
	for (const user of possibleUsers) {
		const { day, month } = birthdayDb.get(user.id) ?? {};
		if (!day || !month) continue;

		if (
			(adjustedMonth === month && adjustedDay === day) ||
			(month === 2 && day === 29 && adjustedMonth === 3 && adjustedDay === 1)
		) {
			const embed = addDefaultEmbedFooter(
				new EmbedBuilder()
					.setTitle("🎉🎉🎉 Birthday time 🎉🎉🎉")
					.setThumbnail(user.displayAvatarURL({ size: 1024 }))
					.setDescription(
						`**CONGRATULATIONS!!!!!** IT'S YOUR **BIRTHDAY**\n@everyone go ahead and congratulate **${user.displayName}** or else >:(`
					)
			);
			await defaultGuild.systemChannel?.send({ content: user.toString(), embeds: [embed] }).catch(() => null);
		}
	}
}

function getMembersWithTimeZone(timezone: string, guild: Guild) {
	return guild.roles.cache.find((role) => role.name == timezone)?.members.map((m) => m);
}

function getMembersWithNoTimeZone(guild: Guild) {
	return guild.members.cache
		.filter((m) => !m.roles.cache.some((r) => r.name.startsWith("UTC")))
		.map((m) => m);
}

function getTimezoneForTargetHour(targetHour: number): number {
	for (let tz = -12; tz < 14; tz++) {
		const offsetdate = new Date(Date.now() + tz * 60 * 60 * 1000);
		if (offsetdate.getUTCHours() === targetHour) return tz;
	}
	throw NaN; // this shouldn't happen, return NaN to do nothing
}
