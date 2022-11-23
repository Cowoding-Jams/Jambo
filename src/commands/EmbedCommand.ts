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
	fieldCache = new Map<string, string[]>();

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

		if (fields.some((field) => field.length < 1 || field.length > 256)) {
			await interaction.reply({
				content: "Field titles must be between 1 and 256 characters long",
				ephemeral: true,
			});
			return;
		}

		const cacheId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(36);
		this.fieldCache.set(cacheId, fields);

		const modal = new ModalBuilder()
			.setCustomId(`embed.${showAuthor}.${cacheId}`)
			.setTitle("Create your own embed!");

		modal.addComponents(
			new ActionRowBuilder<TextInputBuilder>().addComponents(
				new TextInputBuilder()
					.setCustomId("title")
					.setLabel("Embed title")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder("Enter a title")
					.setMinLength(1)
					.setMaxLength(256)
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
					.setMaxLength(4000) // description limits is 4096 but field limit is 4000
			)
		);

		for (const field of fields) {
			modal.addComponents(
				new ActionRowBuilder<TextInputBuilder>().addComponents(
					new TextInputBuilder()
						.setCustomId(`field.${fields.indexOf(field)}`)
						.setLabel(field)
						.setStyle(TextInputStyle.Paragraph)
						.setPlaceholder(`${field}`)
						.setMinLength(1)
						.setMaxLength(1024)
				)
			);
		}

		await interaction.showModal(modal);
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
