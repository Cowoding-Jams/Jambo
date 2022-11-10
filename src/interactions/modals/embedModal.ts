import { Modal } from "../interactionClasses";
import { EmbedBuilder, ModalSubmitInteraction } from "discord.js";
import { addDefaultEmbedFooter } from "../../util/misc/embeds";
import { config } from "../../config";

class EmbedModal extends Modal {
	constructor() {
		super("embed");
	}

	async execute(interaction: ModalSubmitInteraction, customId: string[]): Promise<void> {
		const showAuthor = customId.shift() === "true";
		const title = interaction.fields.getTextInputValue("title");
		const description = interaction.fields.getTextInputValue("description");

		let embed = new EmbedBuilder().setTitle(title).setDescription(description);

		for (const field of customId) {
			const val = interaction.fields.getTextInputValue(field);
			embed.addFields({ name: field, value: val });
		}

		// I will change this once my other branch gets merged...
		embed = showAuthor ? addDefaultEmbedFooter(embed) : embed.setColor(config.color);

		interaction.reply({ embeds: [embed] });
	}
}

export default new EmbedModal();
