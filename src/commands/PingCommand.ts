import { Command } from "../Command";
import { CommandInteraction } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";

class PingCommand extends Command {
	constructor() {
		super("ping");
	}

	async execute(interaction: CommandInteraction): Promise<void> {
		const botping: number = Math.round(interaction.client.ws.ping);
		await interaction.reply(`Pong! (Bot ping: ${botping}ms)`);
	}

	register(): SlashCommandBuilder | Omit<SlashCommandBuilder, "addSubcommandGroup" | "addSubcommand"> {
		return new SlashCommandBuilder().setName("ping").setDescription("Replies pong and the bots ping.");
	}
}

export default new PingCommand();
