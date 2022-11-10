import { Command } from "../interactions/interactionClasses";
import {
	ChatInputCommandInteraction,
	SlashCommandBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
	ActionRowBuilder,
} from "discord.js";

class EmbedCommand extends Command {
	constructor() {
		super("embed");
	}

	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		const fields = interaction.options.getString("fields")?.replace(",", ".") ?? "";
		const showAuthor = interaction.options.getBoolean("show-author") ?? false;

		const modal = new ModalBuilder()
			.setCustomId(`embed.${showAuthor}${fields ? "." + fields : ""}`)
			.setTitle("Add a new proposal!");

		modal.addComponents(
			new ActionRowBuilder<TextInputBuilder>().addComponents(
				new TextInputBuilder()
					.setCustomId("title")
					.setLabel("Embed title")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder("Enter a title")
					.setMinLength(1)
					.setMaxLength(100)
			)
		);

		modal.addComponents(
			new ActionRowBuilder<TextInputBuilder>().addComponents(
				new TextInputBuilder()
					.setCustomId("description")
					.setLabel("Embed description")
					.setStyle(TextInputStyle.Paragraph)
					.setPlaceholder("Enter a description")
					.setMinLength(1)
					.setMaxLength(400)
			)
		);

		for (const field of fields.split(".")) {
			modal.addComponents(
				new ActionRowBuilder<TextInputBuilder>().addComponents(
					new TextInputBuilder()
						.setCustomId(field)
						.setLabel(field)
						.setStyle(TextInputStyle.Paragraph)
						.setPlaceholder(`Enter some text for ${field}`)
						.setMinLength(1)
						.setMaxLength(400)
				)
			);
		}
	}

	register(): SlashCommandBuilder | Omit<SlashCommandBuilder, "addSubcommandGroup" | "addSubcommand"> {
		return new SlashCommandBuilder()
			.setName("embed")
			.setDescription("Creates an embed for you.")
			.addStringOption((option) =>
				option
					.setName("fields")
					.setDescription("Titles for up to 3 fields (comma seperated)")
					.setRequired(false)
			)
			.addBooleanOption((option) =>
				option.setName("show-author").setDescription("Show the author of the embed").setRequired(false)
			);
	}
}

export default new EmbedCommand();
