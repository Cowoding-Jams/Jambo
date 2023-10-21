import { config } from "../config";
import { Command } from "../interactions/interactionClasses";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { hasAdminRole } from "../util/misc/permissions";

class DataCommand extends Command {
	constructor() {
		super("data");
	}

	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		if (await hasAdminRole(interaction)) {
			await interaction.reply({
				files: ["./data/enmap.sqlite", "./data/enmap.sqlite-shm", "./data/enmap.sqlite-wal"],
				ephemeral: true,
			});
		} else {
			await interaction.reply({
				content: "Only admins can use this.",
				ephemeral: true,
			});
		}
	}

	register(): SlashCommandBuilder {
		return new SlashCommandBuilder()
			.setName("data")
			.setDescription(
				`Sends you a copy of the current database file which includes all the data that ${config.botName} is storing.`
			);
	}
}

export default new DataCommand();
