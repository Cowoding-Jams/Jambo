import { Modal } from "../interactionClasses";
import { ModalSubmitInteraction } from "discord.js";

class EmbedModal extends Modal {
	constructor() {
		super("embed");
	}

	async execute(interaction: ModalSubmitInteraction, customId: string[]): Promise<void> {
		await interaction.reply(`You submitted the ${customId} modal.`);
	}
}

export default new EmbedModal();
