import { Command } from "../Command";
import { CommandInteraction } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";

class PingCommand implements Command {
	async execute(interaction: CommandInteraction): Promise<void> {
		await interaction.reply("Pong!");
	}

	getName(): string {
		return "ping";
	}

	register(): SlashCommandBuilder {
		return new SlashCommandBuilder().setName("ping").setDescription("Replies pong.");
	}
}

export default new PingCommand();
