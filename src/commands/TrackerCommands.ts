import { Command } from "../interactions/interactionClasses";
import {
	ChatInputCommandInteraction,
	SlashCommandBuilder,
	SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";
import { latest, logs, playtime, stats } from "../util/tracker/subCommands";
import { userStats } from "../util/tracker/userCommands";
import { gameStats } from "../util/tracker/gameCommands";
import { addBlacklist, remBlacklist } from "../util/tracker/blacklistCommands";
import { config } from "../config";
import { logger } from "../logger";

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
		const statistics = interaction.options.getString("statistic") ?? "general statistics";
		const action = interaction.options.getString("action");
		let err = false;

		try {
			switch (subCommand) {
				case "user":
					await userStats(interaction);
					return;
				case "game":
					await gameStats(interaction);
					return;
				case "general":
					if (statistics == "playtime") await playtime(interaction);
					else if (statistics == "logs") await logs(interaction);
					return;
				case "blacklist":
					if (action == "add") await addBlacklist(interaction);
					else if (action == "rem") await remBlacklist(interaction);
					return;
				case "latest":
					await latest(interaction);
					return;
				case "statistics":
					await stats(interaction);
					return;
			}
		} catch (e) {
			logger.error(e);
			err = true;
		}

		if (!interaction.replied || err) {
			await interaction.reply({
				content:
					"The command you where trying to executed failed... This can happen because there are no logs fitting the given criteria, or you used the wrong order of inputs, which might result in options being available although they shouldn't. Sadly, this is an issue on discords side.",
				ephemeral: true,
			});
		}
	}

	register(): SlashCommandSubcommandsOnlyBuilder {
		if (!config.tracking)
			return new SlashCommandBuilder()
				.setName("tracker")
				.setDescription(
					"The tracking system is disabled which means commands are removed and tracking is paused."
				);
		return new SlashCommandBuilder()
			.setName("tracker")
			.setDescription("The gateway to some cool stats about the people on this server.")
			.addSubcommand((sub) =>
				sub
					.setName("user")
					.setDescription("Get tracking stats about a user.")
					.addUserOption((opt) => opt.setName("user").setDescription("The target user. default: you"))
					.addStringOption((opt) =>
						opt
							.setName("game")
							.setDescription("The game of which to get playtime/logs from. default: every game")
							.setAutocomplete(true)
					)
			)
			.addSubcommand((sub) =>
				sub
					.setName("game")
					.setDescription("Get tracking stats about a game.")
					.addStringOption((opt) =>
						opt
							.setName("game")
							.setDescription("The game of which to get statistics from.")
							.setRequired(true)
							.setAutocomplete(true)
					)
			)
			.addSubcommand((sub) =>
				sub
					.setName("general")
					.setDescription("overall statistics without the need to specify a user or game")
					.addStringOption((opt) =>
						opt
							.setName("statistic")
							.setDescription("Choose the statistic which should get shown.")
							.addChoices({ name: "playtime", value: "playtime" }, { name: "logs", value: "logs" })
							.setRequired(true)
					)
					.addUserOption((opt) => opt.setName("user").setDescription("The Target User"))
					.addStringOption((opt) =>
						opt.setName("game").setDescription("The target Game").setAutocomplete(true)
					)
			)

			.addSubcommand((sub) =>
				sub
					.setName("blacklist")
					.setDescription("[ADMIN ONLY] edit the tracking blacklist to allow or block certain games.")
					.addStringOption((opt) =>
						opt
							.setName("action")
							.setDescription("Select which action should get executed.")
							.addChoices({ name: "add", value: "add" }, { name: "remove", value: "rem" })
							.setRequired(true)
					)
					.addStringOption((opt) =>
						opt
							.setName("game")
							.setDescription("The game on which the action should be performed.")
							.setRequired(true)
							.setAutocomplete(true)
					)
			)
			.addSubcommand((sub) =>
				sub
					.setName("latest")
					.setDescription("See the latest logs across the whole system.")
					.addStringOption((opt) =>
						opt
							.setName("game")
							.setDescription("The game of which the latest logs should get shown.") // bad wording and it sounds bad, ik
							.setAutocomplete(true)
					)
					.addUserOption(
						(opt) => opt.setName("user").setDescription("The user who's latest logs should get show.") // bad wording and it sounds bad, ik
					)
			)
			.addSubcommand((sub) =>
				sub.setName("statistics").setDescription("See general statistics across the whole system.")
			);
	}
}

export default new Tracker();
