import { Command } from "../interactions/interactionClasses";
import {
	ActionRowBuilder,
	ChatInputCommandInteraction,
	ModalBuilder,
	SlashCommandBuilder,
	TextInputBuilder,
	TextInputStyle,
} from "discord.js";

class EmbedCommand extends Command {
	constructor() {
		super("embed");
	}

	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		const fields =
			interaction.options
				.getString("fields")
				?.split(",")
				.map((s) => s.trim())
				.filter((s) => s)
				.slice(0, 3) ?? [];
		const showAuthor = interaction.options.getBoolean("show-author") ?? false;

		const modal = new ModalBuilder()
			.setCustomId(`embed.${showAuthor}${fields.length ? "." + fields.join(".") : ""}`)
			.setTitle("Create your own embed!");

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

		for (const field of fields) {
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

		interaction.showModal(modal);
	}

	register(): SlashCommandBuilder | Omit<SlashCommandBuilder, "addSubcommandGroup" | "addSubcommand"> {
		return new SlashCommandBuilder()
			.setName("embed")
			.setDescription("Creates an embed for you.")
			.addStringOption((option) =>
				option
					.setName("fields")
					.setDescription("Titles for up to 3 fields (comma separated)")
					.setRequired(false)
			)
			.addBooleanOption((option) =>
				option.setName("show-author").setDescription("Show the author of the embed").setRequired(false)
			);
	}
}

export default new EmbedCommand();
