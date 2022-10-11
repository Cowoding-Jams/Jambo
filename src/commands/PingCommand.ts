import { ActionRowBuilder, ChatInputCommandInteraction, SelectMenuBuilder, SlashCommandBuilder } from "discord.js";
import { Command } from "../handler";

class PingCommand extends Command {
	constructor() {
		super("ping");
	}

	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		const botping: number = Math.round(interaction.client.ws.ping);
		await interaction.reply({
			content: `Pong! (Bot ping: ${botping}ms)`,
			components: [
				new ActionRowBuilder<SelectMenuBuilder>().addComponents(
					new SelectMenuBuilder().setCustomId("ping.exampleSelectMenu").setPlaceholder("Nothing selected").addOptions(
						{
							label: "Select me",
							description: "This is a description",
							value: "first_option",
						},
						{
							label: "You can select me too",
							description: "This is also a description",
							value: "second_option",
						}
					)
				),
			],
		});
	}

	register(): SlashCommandBuilder | Omit<SlashCommandBuilder, "addSubcommandGroup" | "addSubcommand"> {
		return new SlashCommandBuilder().setName("ping").setDescription("Replies pong and the bots ping.");
	}
}

export default new PingCommand();
