import { Command } from "../interactions/interactionClasses";
import {
	ChatInputCommandInteraction,
	EmbedBuilder,
	SlashCommandBuilder,
	SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";
import { latest, logs, playtime, stats } from "../util/tracker/subCommands";
import { userLast, userStats, userTop } from "../util/tracker/userCommands";
import { gameLast, gameStats, gameTop } from "../util/tracker/gameCommands";
import { addBlacklist, remBlacklist } from "../util/tracker/blacklistCommands";
import { config } from "../config";

class Tracker extends Command {
	constructor() {
		super("tracker");
	}

	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		if (!config.tracking) {
			await interaction.reply({
				content:
					"Tracking is disabled. No game activity's will be logged and tracking commands are disabled.",
				ephemeral: true,
			});
			return;
		}
		const subCommand = interaction.options.getSubcommand();
		const statistics = interaction.options.getString("statistic")
			? interaction.options.getString("statistic")
			: "stats";
		const action = interaction.options.getString("action");
		switch (subCommand) {
			case "user":
				if (statistics == "playtime") {
					await playtime(interaction);
				} else if (statistics == "logs") {
					await logs(interaction);
				} else if (statistics == "general statistics") {
					await userStats(interaction);
				} else if (statistics == "top 5 most played games") {
					await userTop(interaction, "playtime");
				} else if (statistics == "top 5 most logged games") {
					await userTop(interaction, "logs");
				} else if (statistics == "latest 5 logs") {
					await userLast(interaction);
				}
				return;
			case "game":
				if (statistics == "general statistics") {
					await gameStats(interaction);
				} else if (statistics == "top 5 most played games") {
					await gameTop(interaction, "playtime");
				} else if (statistics == "top 5 most logged games") {
					await gameTop(interaction, "logs");
				} else if (statistics == "latest 5 logs") {
					await gameLast(interaction);
				}
				return;
			case "blacklist":
				if (action == "add") {
					await addBlacklist(interaction);
				} else if (action == "rem") {
					await remBlacklist(interaction);
				}
				return;
			case "latest":
				await latest(interaction);
				return;
			case "statistics":
				await stats(interaction);
				return;
		}

		if (!interaction.replied) {
			await interaction.reply({
				embeds: [
					new EmbedBuilder()
						.setTitle("invalid options")
						.setDescription(
							"this can happen when you dont follow the order of the given options. Sadly thats a bug by discord (options dont get updated correctly when not in order)\nJust execute the command again in the right order and everything should work!\nIf not, please get in touch with a developer."
						)
						.setColor([255, 255, 0]),
				],
			});
		}
	}

	register(): SlashCommandSubcommandsOnlyBuilder {
		if (!config.tracking)
			return new SlashCommandBuilder()
				.setName("tracker")
				.setDescription(
					"Tracking is disabled. No game activity's will be logged and tracking commands are disabled."
				);
		return new SlashCommandBuilder()
			.setName("tracker")
			.setDescription("The gateway to some cool stats about here being users")
			.addSubcommand((sub) =>
				sub
					.setName("user")
					.setDescription("Get tracking stats about a user")
					.addUserOption((opt) => opt.setName("user").setDescription("the user"))
					.addStringOption((opt) => opt.setName("game").setDescription("the game").setAutocomplete(true))
					.addStringOption((opt) => opt.setName("statistic").setDescription("ye").setAutocomplete(true))
			)
			.addSubcommand((sub) =>
				sub
					.setName("game")
					.setDescription("Get tracking stats about a game")
					.addStringOption((opt) =>
						opt.setName("game").setDescription("the game").setRequired(true).setAutocomplete(true)
					)
					.addStringOption((opt) =>
						opt
							.setName("statistic")
							.setDescription("ye")
							.addChoices(
								{ name: "general statistics", value: "general statistics" },
								{ name: "top 5 most played games", value: "top 5 most played games" },
								{ name: "top 5 most logged games", value: "top 5 most logged games" },
								{ name: "latest 5 logs", value: "latest 5 logs" }
							)
					)
			)
			.addSubcommand((sub) =>
				sub
					.setName("blacklist")
					.setDescription("ADMIN ONLY")
					.addStringOption((opt) =>
						opt
							.setName("action")
							.setDescription("yo")
							.addChoices({ name: "add", value: "add" }, { name: "remove", value: "rem" })
							.setRequired(true)
					)
					.addStringOption((opt) =>
						opt.setName("game").setDescription("the game").setRequired(true).setAutocomplete(true)
					)
			)
			.addSubcommand((sub) =>
				sub.setName("latest").setDescription("See the latest logs across the whole system")
			)
			.addSubcommand((sub) => sub.setName("statistics").setDescription("See some system stats"));
	}
}

export default new Tracker();
