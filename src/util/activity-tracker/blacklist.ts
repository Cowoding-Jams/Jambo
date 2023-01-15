import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { addEmbedColor, addEmbedFooter } from "../misc/embeds";
import { activityTrackerBlacklistDb, activityTrackerLogDb } from "../../db";
import { getBlacklist, splitId } from "./help";

export const blacklistCodes = {
	emptyBlacklist: "empty-blacklist",
	missingPermission: "missing-permission",
	emptyGlobalBlacklist: "empty-global-blacklist",
	trackingDisabled: "tracking-disabled",
	disableTracking: "disable-tracking",
};

export async function blacklistAdd(interaction: ChatInputCommandInteraction): Promise<void> {
	const game = interaction.options.getString("game", true);
	if (game == "Disable Tracking") {
		activityTrackerBlacklistDb.push("general-user", interaction.user.id);
		let embed = new EmbedBuilder()
			.setTitle("Your game activity won't get logged anymore!")
			.setDescription(
				"Tracking is now disabled for you.\nTo activate it again use `/tracking blacklist remove`"
			);
		embed = addEmbedFooter(embed);
		await interaction.reply({ embeds: [embed], ephemeral: true });
		return;
	}

	if (!activityTrackerBlacklistDb.has(interaction.user.id)) {
		activityTrackerBlacklistDb.set(interaction.user.id, []);
	}
	activityTrackerBlacklistDb.push(interaction.user.id, game.toLowerCase());
	await interaction.reply({ content: `"${game}" is now on your blacklist!`, ephemeral: true });

	if (
		!activityTrackerLogDb
			.keyArray()
			.map(splitId)
			.map((e) => e.game)
			.find((e) => e === game.toLowerCase())
	) {
		await interaction.followUp({
			content:
				"Even though no log across all users of that game exists. Maybe double check if you didn't make a spelling error (capitalization doesn't matter).",
		});
	}
}

export async function blacklistRemove(interaction: ChatInputCommandInteraction): Promise<void> {
	const game = interaction.options.getString("game", true);

	if (game === blacklistCodes.trackingDisabled) {
		let blacklistedUser = activityTrackerBlacklistDb.get("general-user");
		if (!blacklistedUser) {
			await interaction.reply({ content: "Something went wrong", ephemeral: true });
			return;
		}

		blacklistedUser = blacklistedUser.filter((e) => e !== interaction.user.id);

		activityTrackerBlacklistDb.set("general-user", blacklistedUser);
		interaction.reply({ content: "Your tracking is activated again!", ephemeral: true });
		return;
	}

	let blacklistedGames = activityTrackerBlacklistDb.get(interaction.user.id);

	if (game === blacklistCodes.emptyBlacklist) {
		interaction.reply({ content: "No games are on your blacklist.", ephemeral: true });
		return;
	}

	if (!blacklistedGames) {
		await interaction.reply({
			content: "You don't have a blacklist to remove items from yet...",
			ephemeral: true,
		});
		return;
	}

	blacklistedGames = blacklistedGames.filter((e) => e !== game);

	activityTrackerBlacklistDb.set(interaction.user.id, blacklistedGames);

	let embed = new EmbedBuilder().setTitle(`"${game}" is now removed from the blacklist`);
	embed = addEmbedColor(embed);
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
					"`\nBlacklisted games: No game is blacklisted. Logging every game."
			);

		embed = addEmbedFooter(embed);
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
	embed = addEmbedFooter(embed);

	await interaction.reply({ embeds: [embed], ephemeral: true });
}
