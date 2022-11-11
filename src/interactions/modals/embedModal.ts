import { Modal } from "../interactionClasses";
import { EmbedBuilder, ModalSubmitInteraction } from "discord.js";
import { addDefaultEmbedFooter, countEmbedCharacters } from "../../util/misc/embeds";
import { config } from "../../config";
import EmbedCommand from "../../commands/EmbedCommand";

class EmbedModal extends Modal {
	constructor() {
		super("embed");
	}

	async execute(interaction: ModalSubmitInteraction, args: string[]): Promise<void> {
		const showAuthor = args[0] === "true";
		const cacheId = args[1];
		const fields = EmbedCommand.fieldCache.get(cacheId) ?? [];
		const title = interaction.fields.getTextInputValue("title");
		const description = interaction.fields.getTextInputValue("description");

		let embed = new EmbedBuilder().setTitle(title).setDescription(description);

		for (const field of fields) {
			const val = interaction.fields.getTextInputValue(`field.${fields.indexOf(field)}`);
			embed.addFields({ name: field, value: val });
		}

		// I will change this once my other branch gets merged...
		embed = showAuthor ? addDefaultEmbedFooter(embed) : embed.setColor(config.color);

		if (countEmbedCharacters(embed) > 6000) {
			await interaction.reply({
				content: "Embed text content must be at most 6000 characters long",
				ephemeral: true,
			});
			return;
		}

		interaction.reply({ embeds: [embed] });
	}
}

export default new EmbedModal();
