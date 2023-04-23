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
class Tracker extends Command {
	constructor() {
		super("tracker");
	}

	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		const sub = interaction.options.getSubcommand();
		const gam = interaction.options.getString("game");
		const sta = interaction.options.getString("statistic")
			? interaction.options.getString("statistic")
			: "stats";
		const act = interaction.options.getString("action");
		let exectued = false;

		switch (sub) {
			case "user":
				if (sta == "playtime" && gam) {
					await playtime(interaction);
					exectued = true;
				} else if (sta == "logs" && gam) {
					await logs(interaction);
					exectued = true;
				} else if (sta == "general statistics") {
					await userStats(interaction);
					exectued = true;
				} else if (sta == "top 5 most played games") {
					await userTop(interaction, "playtime");
					exectued = true;
				} else if (sta == "top 5 most logged games") {
					await userTop(interaction, "logs");
					exectued = true;
				} else if (sta == "Latest 5 logs") {
					await userLast(interaction);
					exectued = true;
				}
				return;
			case "game":
				if (sta == "general statistics") {
					await gameStats(interaction);
					exectued = true;
				} else if (sta == "top 5 most played games") {
					await gameTop(interaction, "playtime");
					exectued = true;
				} else if (sta == "top 5 most logged games") {
					await gameTop(interaction, "logs");
					exectued = true;
				} else if (sta == "Latest 5 logs") {
					await gameLast(interaction);
					exectued = true;
				}
				return;
			case "blacklist":
				if (act == "add") {
					await addBlacklist(interaction);
					exectued = true;
				} else if (act == "rem") {
					await remBlacklist(interaction);
					exectued = true;
				}
				return;
			case "latest":
				await latest(interaction);
				exectued = true;
				return;
			case "statistics":
				await stats(interaction);
				exectued = true;
				return;
		}

		if (!exectued) {
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
								{ name: "Latest 5 logs", value: "Latest 5 logs" }
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
