import { Command } from "../Command";
import { CommandInteraction } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";

class PingCommand extends Command {
	constructor() {
		super("ping");
	}

	async execute(interaction: CommandInteraction): Promise<void> {
		await interaction.reply("Pong!");
	}

	register(): SlashCommandBuilder {
		return new SlashCommandBuilder().setName("ping").setDescription("Replies pong.");
	}
}

export default new PingCommand();
