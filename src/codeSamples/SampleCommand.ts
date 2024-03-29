import { Command } from "../interactions/interactionClasses";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

// set the class name, the export at the bottom and the file name to your desired command name (same as the one in the register function)
class CommandName extends Command {
	constructor() {
		super("bunny"); // the name under which the bot internally stores your command (should be the same as the named set in `register`, must be unique)
	}

	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		// put the logic of your command here
		// for example:
		const num = interaction.options.getInteger("amount") || 1;
		await interaction.reply("🐇".repeat(num));
	}

	register(): SlashCommandBuilder | Omit<SlashCommandBuilder, "addSubcommandGroup" | "addSubcommand"> {
		// set the name and description shown in discord here (these are necessary)
		// (name: string.length = 1-32, description string.length = 1-100)(the name has to be lowercase!)
		// here you can also add things like options to your command
		// see more under https://discord.js.org/#/docs/builders/stable/class/SlashCommandBuilder
		return new SlashCommandBuilder()
			.setName("bunny")
			.setDescription("shows you a cute bunny")
			.addIntegerOption((option) =>
				option.setName("amount").setDescription("number of bunnies").setRequired(false)
			);
	}
}

export default new CommandName();
