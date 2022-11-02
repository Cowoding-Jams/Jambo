import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { addDefaultEmbedFooter } from "../misc/embeds";
import { activityTrackerBlacklistDb, activityTrackerLogDb } from "../../db";
import { getBlacklist } from "./help";
import { logger } from "../../logger";

export async function adminReset(interaction: ChatInputCommandInteraction): Promise<void> {
	const sure: boolean = interaction.options.getBoolean("sure", true);
	const really: string = interaction.options.getString("really", true);

	if (!(sure && really == "yes")) {
		let embed = new EmbedBuilder()
			.setTitle("It seems like your are not really sure.")
			.setDescription(
				"Because you are not really sure if you should reset everything related to tracking, the reset wasn't executed."
			)
			.setColor("#9d4b4b");
		embed = addDefaultEmbedFooter(embed);
		await interaction.reply({ embeds: [embed] });
		return;
	} else {
		let embed = new EmbedBuilder().setTitle("Reseting Logs and Blacklist...").setColor("#9d9e4c");
		embed = addDefaultEmbedFooter(embed);
		await interaction.reply({ embeds: [embed] });
	}

	activityTrackerLogDb.clear();
	activityTrackerBlacklistDb.clear();
	activityTrackerBlacklistDb.ensure("general-user", []);
	activityTrackerBlacklistDb.ensure("general-game", []);

	let embed = new EmbedBuilder().setTitle("Reset done!").setColor("#4c9e4f");
	embed = addDefaultEmbedFooter(embed);
	await interaction.editReply({ embeds: [embed] });
}

export async function adminBlacklistGame(interaction: ChatInputCommandInteraction): Promise<void> {
	const game = interaction.options.getString("game", true);
	activityTrackerBlacklistDb.push("general-game", game.toLowerCase());

	let embed = new EmbedBuilder()
		.setTitle("Added a game to blacklist!")
		.setDescription(`No activity about "${game}" will be logged anymore.`);
	embed = addDefaultEmbedFooter(embed);
	await interaction.reply({ embeds: [embed], ephemeral: true });
}

export async function adminWhitelistGame(interaction: ChatInputCommandInteraction): Promise<void> {
	const game = interaction.options.getString("game", true).toLowerCase();

	if (game == "empty-global-blacklist") {
		let embed = new EmbedBuilder().setTitle("The global blacklist is empty...");

		embed = addDefaultEmbedFooter(embed);
		interaction.reply({ embeds: [embed], ephemeral: true });
	}

	let blacklistedGames: string[] | undefined = activityTrackerBlacklistDb.get("general-game");

	if (!blacklistedGames) {
		let embed = new EmbedBuilder().setTitle("Something went wrong...");
		embed = addDefaultEmbedFooter(embed);
		await interaction.reply({ embeds: [embed], ephemeral: true });
		logger.error(
			"Something went wrong while trying to get the global blacklist. Couldn't get the 'general-game' key."
		);
		return;
	}

	blacklistedGames = blacklistedGames?.filter((e) => e !== game);

	activityTrackerBlacklistDb.set("general-game", blacklistedGames);

	let embed = new EmbedBuilder()
		.setTitle("Removed a game from the global blacklist!")
		.setDescription(`Removed "${game}" from global blacklist.`);
	embed = addDefaultEmbedFooter(embed);
	await interaction.reply({ embeds: [embed], ephemeral: true });
}

export async function adminLook(interaction: ChatInputCommandInteraction): Promise<void> {
	const user = interaction.options.getUser("user", true);
	const blacklist = await getBlacklist(user.id);

	if (blacklist?.length == 0 || blacklist == undefined) {
		let embed = new EmbedBuilder()
			.setTitle(`${user.tag}'s blacklist`)
			.setDescription(
				"Tracking status: `" +
					(activityTrackerBlacklistDb.get("general-user")?.includes(user.id) ? "disabled" : "enabled") +
					"`\nBlacklisted games: No game is blacklisted. Every game gets logged"
			);
		embed = addDefaultEmbedFooter(embed);
		await interaction.reply({ embeds: [embed], ephemeral: true });
		return;
	}

	const str = "`" + blacklist.join("`, `") + "`";

	let embed = new EmbedBuilder()
		.setTitle(`${user.tag}'s blacklist`)
		.setDescription(
			"Trackstatus: `" +
				(activityTrackerBlacklistDb.get("general-user")?.includes(user.id) ? "disabled" : "enabled") +
				"`\nBlacklisted games: " +
				str
		);
	embed = addDefaultEmbedFooter(embed);
	await interaction.reply({ embeds: [embed], ephemeral: true });
}

export async function adminShow(interaction: ChatInputCommandInteraction) {
	const blacklist: string[] | undefined = activityTrackerBlacklistDb.get("general-game");

	if (!blacklist || blacklist.length == 0) {
		let embed = new EmbedBuilder().setTitle("The global blacklist is empty...");
		embed = addDefaultEmbedFooter(embed);
		await interaction.reply({ embeds: [embed], ephemeral: true });
		return;
	}

	const str = "`" + blacklist?.join("`, `") + "`";
	let embed = new EmbedBuilder().setTitle("Global Blacklist").setDescription(str);
	embed = addDefaultEmbedFooter(embed);
	await interaction.reply({ embeds: [embed], ephemeral: true });
}
