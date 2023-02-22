import { Command } from "../interactions/interactionClasses";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

class Update extends Command {
	constructor() {
		super("update");
	}

	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		interaction.client.application.commands.set([]);
		await interaction.reply("Done");
	}

	register(): SlashCommandBuilder | Omit<SlashCommandBuilder, "addSubcommandGroup" | "addSubcommand"> {
		return new SlashCommandBuilder().setName("update").setDescription("clear all commands.");
	}
}

export default new Update();
