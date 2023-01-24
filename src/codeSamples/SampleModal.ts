import { Modal } from "../interactions/interactionClasses";
import { ModalSubmitInteraction } from "discord.js";

class ExampleModal extends Modal {
	constructor() {
		super("exampleModal");
	}

	async execute(interaction: ModalSubmitInteraction, customId: string[]): Promise<void> {
		await interaction.reply(`You submitted the ${customId} modal.`);
	}
}

export default new ExampleModal();
