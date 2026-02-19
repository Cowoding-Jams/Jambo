import { EmbedBuilder, ModalSubmitInteraction } from "discord.js";
import EmbedCommand from "../../commands/EmbedCommand.js";
import { addEmbedColor, addEmbedFooter, countEmbedCharacters } from "../../util/misc/embeds.js";
import { Modal } from "../interactionClasses.js";

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

		embed = showAuthor ? addEmbedFooter(embed) : addEmbedColor(embed);

		if (countEmbedCharacters(embed) > 6000) {
			await interaction.reply({
				content: "Embed text content must be at most 6000 characters long!",
				ephemeral: true,
			});
			return;
		}

		interaction.reply({ embeds: [embed] });
	}
}

export default new EmbedModal();
