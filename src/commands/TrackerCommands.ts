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
class Tracker extends Command {
	constructor() {
		super("tracker");
	}

	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		const group = interaction.options.getSubcommandGroup();
		const sub = interaction.options.getSubcommand();

		switch (group + sub) {
			case "userstats":
				await userStats(interaction);
				return;
			case "userlast":
				await userLast(interaction);
				return;
			case "usertop":
				await userTop(interaction);
				return;
			case "gamestats":
				await gameStats(interaction);
				return;
			case "gamelast":
				await gameLast(interaction);
				return;
			case "gametop":
				await gameTop(interaction);
				return;
			case "blacklistadd":
				await addBlacklist(interaction);
				return;
			case "blacklistremove":
				await remBlacklist(interaction);
				return;
			case "nullplaytime":
				await playtime(interaction);
				return;
			case "nulllogs":
				await logs(interaction);
				return;
			case "nulllast":
				await latest(interaction);
				return;
			case "nullstats":
				await stats(interaction);
				return;
		}
	}

	register(): SlashCommandSubcommandsOnlyBuilder {
		return new SlashCommandBuilder()
			.setName("tracker")
			.setDescription("The gameway to some cool stats about here being users")
			.addSubcommandGroup((group) =>
				group
					.setName("user")
					.setDescription("Get the Tracking data about a certain user")
					.addSubcommand((sub) =>
						sub
							.setName("stats")
							.setDescription("See some interesting statistics about a user")
							.addUserOption((usr) => usr.setName("user").setDescription("go figure: the user"))
					)
					.addSubcommand((sub) =>
						sub
							.setName("last")
							.setDescription("Take a look at the latest logs of a user")
							.addUserOption((usr) => usr.setName("user").setDescription("go figure: the user"))
					)
					.addSubcommand((sub) =>
						sub
							.setName("top")
							.setDescription("Lists you the most logged or played game by a user")
							.addStringOption((opt) =>
								opt
									.setName("filter")
									.setDescription("logs or playtime?")
									.addChoices({ name: "logs", value: "logs" }, { name: "playtime", value: "playtime" })
									.setRequired(true)
							)
							.addUserOption((usr) => usr.setName("user").setDescription("go figure: the user"))
					)
			)
			.addSubcommandGroup((group) =>
				group
					.setName("game")
					.setDescription("Get the tracking data about a certain game")
					.addSubcommand((sub) =>
						sub
							.setName("stats")
							.setDescription("See some interesting statistics about a game")
							.addStringOption((game) =>
								game
									.setName("game")
									.setDescription("go figure: the game")
									.setAutocomplete(true)
									.setRequired(true)
							)
					)
					.addSubcommand((sub) =>
						sub
							.setName("last")
							.setDescription("Take a look at the latest logs of a game")
							.addStringOption((game) =>
								game
									.setName("game")
									.setDescription("go figure: the game")
									.setAutocomplete(true)
									.setRequired(true)
							)
					)
					.addSubcommand((sub) =>
						sub
							.setName("top")
							.setDescription("Lists you the most logged or played game by a game")
							.addStringOption((game) =>
								game
									.setName("game")
									.setDescription("go figure: the game")
									.setAutocomplete(true)
									.setRequired(true)
							)
							.addStringOption((opt) =>
								opt
									.setName("filter")
									.setDescription("logs or playtime?")
									.addChoices({ name: "logs", value: "logs" }, { name: "playtime", value: "playtime" })
									.setRequired(true)
							)
					)
			)
			.addSubcommandGroup((group) =>
				group
					.setName("blacklist")
					.setDescription("edit the playlist (ADMIN ONLY)")
					.addSubcommand((sub) =>
						sub
							.setName("add")
							.setDescription("choose a game which shouldn't get logged anymore")
							.addStringOption((sub) =>
								sub
									.setName("game")
									.setDescription("go figure: the game")
									.setAutocomplete(true)
									.setRequired(true)
							)
					)
					.addSubcommand((sub) =>
						sub
							.setName("remove")
							.setDescription("choose a game which should get logged again")
							.addStringOption((sub) =>
								sub
									.setName("game")
									.setDescription("go figure: the game")
									.setAutocomplete(true)
									.setRequired(true)
							)
					)
			)
			.addSubcommand((sub) =>
				sub
					.setName("playtime")
					.setDescription("how may hours a game got played by a user")
					.addStringOption((game) =>
						game.setName("game").setDescription("go figure: the game").setAutocomplete(true)
					)
					.addUserOption((usr) => usr.setName("user").setDescription("go figure: the user"))
			)
			.addSubcommand((sub) =>
				sub
					.setName("logs")
					.setDescription("See how many logs a user has in a given game")
					.addStringOption((game) =>
						game.setName("game").setDescription("go figure: the game").setAutocomplete(true)
					)
					.addUserOption((usr) => usr.setName("user").setDescription("go figure: the user"))
			)
			.addSubcommand((sub) =>
				sub.setName("last").setDescription("See the latest logs across the whole system")
			)
			.addSubcommand((sub) => sub.setName("stats").setDescription("See some system stats"));
	}
}

export default new Tracker();
