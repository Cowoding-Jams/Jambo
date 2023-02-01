import {
	ChatInputCommandInteraction,
	SlashCommandBuilder,
	SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";
import { Command } from "../interactions/interactionClasses";
import { blacklistAdd, blacklistRemove, blacklistShow } from "../util/activity-tracker/blacklist";
import { statsAll, statsGame, statsMy } from "../util/activity-tracker/statistics";
import {
	adminBlacklistGame,
	adminLook,
	adminReset,
	adminShow,
	adminWhitelistGame,
} from "../util/activity-tracker/admin";
import { list } from "../util/activity-tracker/list";
import { hasAdminRole } from "../util/misc/permissions";

class ActivityTrackerCommand extends Command {
	constructor() {
		super("activity-tracker");
	}

	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		const group: string | null = interaction.options.getSubcommandGroup();
		const sub: string | null = interaction.options.getSubcommand();

		if (group === "blacklist") {
			if (sub === "add") {
				await blacklistAdd(interaction);
			} else if (sub === "remove") {
				await blacklistRemove(interaction);
			} else if (sub === "show") {
				await blacklistShow(interaction);
			}
		} else if (group === "stats") {
			if (sub === "my") {
				await statsMy(interaction);
			} else if (sub === "game") {
				await statsGame(interaction);
			} else if (sub === "all") {
				await statsAll(interaction);
			}
		} else if (group === "admin") {
			if (!hasAdminRole(interaction)) {
				await interaction.reply({
					content: "You don't have the required permissions to use this command.",
					ephemeral: true,
				});
			} else if (sub === "reset") {
				await adminReset(interaction);
			} else if (sub === "blacklist") {
				await adminBlacklistGame(interaction);
			} else if (sub === "whitelist") {
				await adminWhitelistGame(interaction);
			} else if (sub === "look") {
				await adminLook(interaction);
			} else if (sub == "show") {
				await adminShow(interaction);
			}
		} else if (sub == "list") {
			await list(interaction);
		}
	}

	register():
		| SlashCommandSubcommandsOnlyBuilder
		| Omit<SlashCommandBuilder, "addSubcommandGroup" | "addSubcommand"> {
		return new SlashCommandBuilder()
			.setName("activity-tracker")
			.setDescription("A game activity tracker to provide interesting insights in the people on this server.")
			.addSubcommand((sub) =>
				sub
					.setName("list")
					.setDescription("Generates a list of the played games based on a selected sorting method.")
					.addStringOption((opt) =>
						opt
							.setName("sort")
							.setDescription("Criteria to sort by. (default: logs chronologically)")
							.addChoices(
								{ name: "logs chronologically", value: "log-history" },
								{ name: "playtime per game", value: "playtime-per-game" },
								{ name: "number of logs per game", value: "logs-per-game" },
								{ name: "last log date per game", value: "log-date-per-game" }
							)
					)
					.addStringOption((opt) =>
						opt
							.setName("order")
							.setDescription("Ordering. (default: decreasing)")
							.addChoices(
								{ name: "decreasing", value: "decreasing" },
								{ name: "increasing", value: "increasing" }
							)
					)
			)
			.addSubcommandGroup((group) =>
				group
					.setName("stats")
					.setDescription("Gives you statistics based on the game activity.")
					.addSubcommand((sub) =>
						sub
							.setName("my")
							.setDescription("Show statistics about your own logs.")
							.addStringOption((opt) =>
								opt
									.setName("game")
									.setDescription("A single game to use for the stats. (default: all games)")
									.setAutocomplete(true)
							)
					)
					.addSubcommand((sub) =>
						sub
							.setName("game")
							.setDescription("Show statistics about a game across all logs.")
							.addStringOption((opt) =>
								opt
									.setName("game")
									.setDescription("The game to use for the stats.")
									.setAutocomplete(true)
									.setRequired(true)
							)
							.addBooleanOption((opt) =>
								opt
									.setName("show-playtime")
									.setDescription("Show the playtime of the game per player. (default: false)")
							)
					)
					.addSubcommand((sub) => sub.setName("all").setDescription("Show statistics across all logs."))
			)
			.addSubcommandGroup((group) =>
				group
					.setName("blacklist")
					.setDescription(
						"Manage your activity blacklist. (The activity of a blacklisted game will not be logged)"
					)
					.addSubcommand((sub) =>
						sub
							.setName("add")
							.setDescription("Add a game to your blacklist.")
							.addStringOption((opt) =>
								opt
									.setName("game")
									.setDescription("The game to blacklist.")
									.setAutocomplete(true)
									.setRequired(true)
							)
					)
					.addSubcommand((sub) =>
						sub
							.setName("remove")
							.setDescription("Remove a game from your blacklist.")
							.addStringOption((opt) =>
								opt
									.setName("game")
									.setDescription("The game to whitelist.")
									.setAutocomplete(true)
									.setRequired(true)
							)
					)
					.addSubcommand((sub) => sub.setName("show").setDescription("See what is on your blacklist."))
			)
			.addSubcommandGroup((group) =>
				group
					.setName("admin")
					.setDescription("Admin commands to manage the activity tracker.")
					.addSubcommand((sub) =>
						sub
							.setName("reset")
							.setDescription("Reset every log and blacklist entry.")
							.addBooleanOption((opt) =>
								opt.setName("sure").setDescription("Are you really sure?").setRequired(true)
							)
							.addStringOption((opt) =>
								opt
									.setName("really")
									.setDescription("Are you really sure you want to delete every entry?")
									.addChoices(
										{ name: "No. I don't want to delete every log and blacklist entry!", value: "no" },
										{ name: "Yes. I am sure. I want to delete every log and blacklist entry!", value: "yes" }
									)
									.setRequired(true)
							)
					)
					.addSubcommand((sub) =>
						sub
							.setName("blacklist")
							.setDescription("Add a game to the global blacklist.")
							.addStringOption((opt) =>
								opt
									.setName("game")
									.setDescription("The game to blacklist.")
									.setRequired(true)
									.setAutocomplete(true)
							)
					)
					.addSubcommand((sub) =>
						sub
							.setName("whitelist")
							.setDescription("Remove a game from the global blacklist.")
							.addStringOption((opt) =>
								opt
									.setName("game")
									.setDescription("The game to whitelist.")
									.setRequired(true)
									.setAutocomplete(true)
							)
					)
					.addSubcommand((sub) => sub.setName("show").setDescription("See what is on the global blacklist."))
					.addSubcommand((sub) =>
						sub
							.setName("look")
							.setDescription("View a users personal blacklist.")
							.addUserOption((opt) =>
								opt.setName("user").setDescription("The user to view the blacklist from.").setRequired(true)
							)
					)
			);
	}
}

export default new ActivityTrackerCommand();
