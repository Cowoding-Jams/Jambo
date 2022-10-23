import {
	ChatInputCommandInteraction,
	SlashCommandBuilder,
	SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";
import { Command } from "../interactions/interactionClasses";
import { hasAdminPerms } from "../util/misc/permissions";
import { config } from "../config";
import { blacklistAdd, blacklistRemove, blacklistShow } from "../util/tracker/blacklist";
import { statisticsAllstats, statisticsGamestats, statisticsMystats } from "../util/tracker/statistics";
import {
	adminBlacklistgame,
	adminLook,
	adminReset,
	adminShow,
	adminWhitelistgame,
} from "../util/tracker/admin";

class TrackerCommand extends Command {
	constructor() {
		super("tracker");
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
		} else if (group === "statistics") {
			if (sub === "mystats") {
				await statisticsMystats(interaction);
			} else if (sub === "gamestats") {
				await statisticsGamestats(interaction);
			} else if (sub === "allstats") {
				await statisticsAllstats(interaction);
			}
		} else if (group === "admin") {
			if (!hasAdminPerms(interaction)) {
				return;
			} else if (sub === "reset") {
				await adminReset(interaction);
			} else if (sub === "blacklistgame") {
				await adminBlacklistgame(interaction);
			} else if (sub === "whitelistgame") {
				await adminWhitelistgame(interaction);
			} else if (sub === "look") {
				await adminLook(interaction);
			} else if (sub == "show") {
				await adminShow(interaction);
			}
		} else if (sub === "disabled") {
			await interaction.reply({
				content:
					"Activity Logging is Disabled for this bot.\nIf it gets activated again you can find more commands which start with `/tracker`",
				ephemeral: true,
			});
		}
	}

	register():
		| SlashCommandBuilder
		| SlashCommandSubcommandsOnlyBuilder
		| Omit<SlashCommandBuilder, "addSubcommandGroup" | "addSubcommand"> {
		if (!config.logActivity) {
			return new SlashCommandBuilder()
				.setName("tracker")
				.setDescription("Tracking is disabled")
				.addSubcommand((sub) => sub.setName("disabled").setDescription("Tracking is disabled"));
		}
		return new SlashCommandBuilder()
			.setName("tracker")
			.setDescription("All commands associated with the Game activity tracker!")
			.addSubcommandGroup((group) =>
				group
					.setName("blacklist")
					.setDescription("Tracking blacklist")
					.addSubcommand((sub) =>
						sub
							.setName("add")
							.setDescription("add a game to your blacklist")
							.addStringOption((opt) =>
								opt
									.setName("game")
									.setDescription("Enter game or dont enter anything to disable your logging")
							)
					)
					.addSubcommand((sub) =>
						sub
							.setName("remove")
							.setDescription("remove a game from your blacklist")
							.addStringOption((opt) =>
								opt
									.setName("game")
									.setDescription("Enter game or dont enter anything to enable your logging")
									.setAutocomplete(true)
									.setRequired(true)
							)
					)
					.addSubcommand((sub) => sub.setName("show").setDescription("See what is on your blacklist"))
			)
			.addSubcommandGroup((group) =>
				group
					.setName("statistics")
					.setDescription("Show statistics")
					.addSubcommand((sub) =>
						sub
							.setName("mystats")
							.setDescription("Show your activity statistics")
							.addStringOption((opt) =>
								opt
									.setName("game")
									.setDescription("Show statistics for a specific game")
									.setAutocomplete(true)
							)
					)
					.addSubcommand((sub) =>
						sub
							.setName("gamestats")
							.setDescription("Show statistics for a specific game across all users")
							.addStringOption((opt) =>
								opt
									.setName("game")
									.setDescription("Show statistics for a specific game")
									.setAutocomplete(true)
									.setRequired(true)
							)
					)
					.addSubcommand((sub) =>
						sub.setName("allstats").setDescription("Show statistics about all games across all users")
					)
			)
			.addSubcommandGroup((group) =>
				group
					.setName("admin")
					.setDescription("admin only commands")
					.addSubcommand((sub) =>
						sub
							.setName("reset")
							.setDescription("Reset every log and blacklist entry")
							.addBooleanOption((opt) =>
								opt.setName("sure").setDescription("Are you really sure?").setRequired(true)
							)
							.addStringOption((opt) =>
								opt
									.setName("really")
									.setDescription("Are you really sure you want to delete every entry?")
									.addChoices(
										{ name: "No. I dont want to delete every log and blacklist entry!", value: "no" },
										{ name: "Yes I am sure. I want to delete every log and blacklist entry!", value: "yes" }
									)
									.setRequired(true)
							)
					)
					.addSubcommand((sub) =>
						sub
							.setName("blacklistgame")
							.setDescription("Blacklist a game for all users.")
							.addStringOption((opt) =>
								opt
									.setName("game")
									.setDescription("The game which should get blacklisted globaly")
									.setRequired(true)
							)
					)
					.addSubcommand((sub) =>
						sub
							.setName("whitelistgame")
							.setDescription("Remove a game from the global blacklist")
							.addStringOption((opt) =>
								opt
									.setName("game")
									.setDescription("The game which should get removed from the global blacklist")
									.setRequired(true)
									.setAutocomplete(true)
							)
					)
					.addSubcommand((sub) =>
						sub
							.setName("look")
							.setDescription("take a look into the blacklist of someone else")
							.addUserOption((opt) =>
								opt
									.setName("user")
									.setDescription("the user of whos blacklist should get shown")
									.setRequired(true)
							)
					)
					.addSubcommand((sub) => sub.setName("show").setDescription("Show global blacklist"))
			);
	}
}

export default new TrackerCommand();
