import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { addDefaultEmbedFooter } from "../misc/embeds";
import { activityTrackerBlacklistDb } from "../../db";
import { getBlacklist } from "./help";

export async function blacklistAdd(interaction: ChatInputCommandInteraction): Promise<void> {
	const game = interaction.options.getString("game", true);
	if (game == "Disable Tracking") {
		activityTrackerBlacklistDb.push("general-user", interaction.user.id);
		let embed = new EmbedBuilder()
			.setTitle("Your game activity wont get logged anymore")
			.setDescription(
				"Tracking is now disabled for you. To activate it again use `/tracking blacklist remove`"
			);
		embed = addDefaultEmbedFooter(embed);
		await interaction.reply({ embeds: [embed], ephemeral: true });
		return;
	}

	if (!activityTrackerBlacklistDb.has(interaction.user.id)) {
		activityTrackerBlacklistDb.set(interaction.user.id, []);
	}
	activityTrackerBlacklistDb.push(interaction.user.id, game.toLowerCase());

	let embed = new EmbedBuilder().setTitle(`"${game}" is now on your blacklist`);

	embed = addDefaultEmbedFooter(embed);
	await interaction.reply({ embeds: [embed], ephemeral: true });
}

export async function blacklistRemove(interaction: ChatInputCommandInteraction): Promise<void> {
	const game = interaction.options.getString("game", true);

	if (game === "Tracking is disabled, select this to activate it again") {
		let blacklistedUser = activityTrackerBlacklistDb.get("general-user");
		if (!blacklistedUser) {
			let embed = new EmbedBuilder().setTitle("Something went wrong");
			embed = addDefaultEmbedFooter(embed);
			await interaction.reply({ embeds: [embed], ephemeral: true });
			return;
		}

		blacklistedUser = blacklistedUser.filter((e) => e !== interaction.user.id);

		activityTrackerBlacklistDb.set("general-user", blacklistedUser);

		let embed = new EmbedBuilder().setTitle("Your tracking is activated again!");
		embed = addDefaultEmbedFooter(embed);
		interaction.reply({ embeds: [embed], ephemeral: true });
		return;
	}

	let blacklistedGames: string[] | undefined = activityTrackerBlacklistDb.get(interaction.user.id);

	if (game === "No games are on your blacklist") {
		let embed = new EmbedBuilder().setTitle("No games are on your blacklist");
		embed = addDefaultEmbedFooter(embed);
		interaction.reply({ embeds: [embed], ephemeral: true });
		return;
	}

	if (!blacklistedGames) {
		let embed = new EmbedBuilder().setTitle("Something went wrong");
		embed = addDefaultEmbedFooter(embed);
		await interaction.reply({ embeds: [embed], ephemeral: true });
		return;
	}

	blacklistedGames = blacklistedGames?.filter((e) => e !== game);

	activityTrackerBlacklistDb.set(interaction.user.id, blacklistedGames);

	let embed = new EmbedBuilder().setTitle(`"${game}" is now removed from the blacklist`);
	embed = addDefaultEmbedFooter(embed);
	await interaction.reply({ embeds: [embed], ephemeral: true });
}

export async function blacklistShow(interaction: ChatInputCommandInteraction): Promise<void> {
	const blacklist = await getBlacklist(interaction.user.id);

	if (blacklist?.length == 0 || blacklist == undefined) {
		let embed = new EmbedBuilder()
			.setTitle("Your Blacklist")
			.setDescription(
				"Tracking status: `" +
					(activityTrackerBlacklistDb.get("general-user")?.includes(interaction.user.id)
						? "disabled"
						: "enabled") +
					"`\nBlacklisted games: No game is blacklisted. Every game gets logged"
			);

		embed = addDefaultEmbedFooter(embed);
		await interaction.reply({ embeds: [embed], ephemeral: true });
		return;
	}

	const str = "`" + blacklist.join("`, `") + "`";

	let embed = new EmbedBuilder()
		.setTitle("Your blacklist")
		.setDescription(
			"Trackstatus: `" +
				(activityTrackerBlacklistDb.get("general-user")?.includes(interaction.user.id)
					? "disabled"
					: "enabled") +
				"`\nBlacklisted games: " +
				str
		);
	embed = addDefaultEmbedFooter(embed);

	await interaction.reply({ embeds: [embed], ephemeral: true });
}
