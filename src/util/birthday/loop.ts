import { Client, EmbedBuilder } from "discord.js";
import { birthdayDb } from "../../db";
import { ctx } from "../../ctx";
import { addEmbedFooter } from "../misc/embeds";
import { DateTime } from "luxon";
import { logger } from "../../logger";

export async function birthdayMessageTick(client: Client) {
	const defaultGuild = await client.guilds.fetch(ctx.defaultGuild);

	const now = DateTime.now();
	const birthdays = birthdayDb
		.map((d, key) => ({ user: key, date: d.set({ year: now.year }) }))
		.filter((d) => -0.5 < d.date.diffNow().as("hours") && d.date.diffNow().as("hours") <= 0.5);

	for (const { user, date } of birthdays) {
		const guildUser = await defaultGuild.members.fetch(user).catch(() => {
			birthdayDb.delete(user);
			return null;
		});
		if (!guildUser) continue;
		const age = getAge(date);
		const embed = addEmbedFooter(
			new EmbedBuilder()
				.setTitle(`🎉🎊🎆 Happy Birthday ${guildUser.displayName}!!! 🎈🎇🎉`)
				.setThumbnail(guildUser.displayAvatarURL({ size: 1024 }))
				.setDescription(
					`Congratulations to your ${age ? age + "th " : ""}birthday!${
						age ? `\n${age} years... That's pretty old :)` : ""
					}\n@everyone go ahead and congratulate **${guildUser.displayName}** or else >:(`
				)
		).setColor(guildUser.displayHexColor);

		const sysChannel = defaultGuild.systemChannel;
		if (sysChannel) sysChannel.send({ content: guildUser.toString(), embeds: [embed] });
		else logger.warn("Failed to send birthday message because system channel isn't set!");
	}
}

export function getAge(date: DateTime): number | null {
	return date.year == 0 ? null : Math.floor(date.diffNow().as("years") * -1);
}
