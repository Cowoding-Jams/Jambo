import { Command } from "../interactions/interactionClasses";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { trackerGames, trackerLogs, trackerUsers } from "../db";
class Tracker extends Command {
	constructor() {
		super("tracker");
	}

	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		await interaction.reply(
			`Logs\`\`\`json\n${JSON.stringify([
				...trackerLogs.entries(),
			])}\n\`\`\`\n\nGames\`\`\`json\n${JSON.stringify([
				...trackerGames.entries(),
			])}\n\`\`\`\n\nUsers\`\`\`json\n${JSON.stringify([...trackerUsers.entries()])}\n\`\`\``
		);
	}

	register(): SlashCommandBuilder | Omit<SlashCommandBuilder, "addSubcommandGroup" | "addSubcommand"> {
		return new SlashCommandBuilder().setName("tracker").setDescription("Desakjdhuöaoid");
	}
}

export default new Tracker();
