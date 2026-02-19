import { ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandOptionsOnlyBuilder } from "discord.js";
import { Command } from "../interactions/interactionClasses.js";

class PingCommand extends Command {
	constructor() {
		super("ping");
	}

	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		const ping: number = Math.round(interaction.client.ws.ping);
		await interaction.reply(`Pong! (Bot ping: ${ping}ms)`);
	}

	register(): SlashCommandOptionsOnlyBuilder {
		return new SlashCommandBuilder().setName("ping").setDescription("Replies pong and the bots ping.");
	}
}

export default new PingCommand();
