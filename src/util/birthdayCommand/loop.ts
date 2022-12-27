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
		.filter((d) => d.date >= now && d.date.diffNow().as("hours") < 1);

	for (const { user, date } of birthdays) {
		const guildUser = await defaultGuild.members.fetch(user);
		const birthYear = birthdayDb.get(user)!.year;
		const age = birthYear === 0 ? null : date.year - birthYear;
		const embed = addEmbedFooter(
			new EmbedBuilder()
				.setTitle(`🎉🎊🎆 Happy Birthday ${guildUser.displayName}!!! 🎈🎇🎉`)
				.setThumbnail(guildUser.displayAvatarURL({ size: 1024 }))
				.setDescription(
					`Congratulations to your ${age ? age + "th " : ""}birthday!${
						age ? `\n${age} years... That's pretty old :)` : ""
					}\n@everyone go ahead and congratulate **${guildUser.displayName}** or else >:(`
				)
		);

		const sysChannel = defaultGuild.systemChannel;
		if (sysChannel) sysChannel.send({ content: guildUser.toString(), embeds: [embed] });
		else logger.error("No system channel found to send birthday messages to!");
	}
}
