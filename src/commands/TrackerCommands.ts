import { Command } from "../interactions/interactionClasses";
import {
	ChatInputCommandInteraction,
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
		const statistics = interaction.options.getString("statistic") ?? "general statistics";
		const action = interaction.options.getString("action");
		switch (subCommand) {
			case "user":
				if (statistics == "playtime")
					await playtime(interaction);
				else if (statistics == "logs")
					await logs(interaction);
				else if (statistics == "general statistics")
					await userStats(interaction);
				else if (statistics == "top 5 most played games")
					await userTop(interaction, "playtime");
				else if (statistics == "top 5 most logged games")
					await userTop(interaction, "logs");
				else if (statistics == "latest 5 logs")
					await userLast(interaction);
				return;
			case "game":
				if (statistics == "general statistics")
					await gameStats(interaction);
				else if (statistics == "top 5 most played games") 
					await gameTop(interaction, "playtime");
				else if (statistics == "top 5 most logged games") 
					await gameTop(interaction, "logs");
				else if (statistics == "latest 5 logs") 
					await gameLast(interaction);
				
				return;
			case "blacklist":
				if (action == "add")
					await addBlacklist(interaction);
				else if (action == "rem")
					await remBlacklist(interaction);
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
				content:
					"This can happen when you don't follow the order of the given options. Sadly thats a bug by discord (options don't get updated correctly when not in order)\nJust execute the command again in the right order and everything should work!\nIf not, please get in touch with a developer.",
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
					.addUserOption((opt) =>
						opt.setName("user").setDescription("The target user, if not given defaults to you.")
					)
					.addStringOption((opt) =>
						opt
							.setName("game")
							.setDescription("The game of which to get playtime/logs from.")
							.setAutocomplete(true)
					)
					.addStringOption((opt) =>
						opt
							.setName("statistic")
							.setDescription(
								"Select what statistics should get shown. (Options depend on if a game is given or not)"
							)
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
					.addStringOption((opt) =>
						opt
							.setName("statistic")
							.setDescription("Select what statistics should get shown.")
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
				sub.setName("latest").setDescription("See the latest logs across the whole system.")
			)
			.addSubcommand((sub) =>
				sub.setName("statistics").setDescription("See general statistics across the whole system.")
			);
	}
}

export default new Tracker();
