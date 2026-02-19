import { ModalSubmitInteraction } from "discord.js";
import { Modal } from "../interactions/interactionClasses.js";

class ExampleModal extends Modal {
	constructor() {
		super("exampleModal");
	}

	async execute(interaction: ModalSubmitInteraction, customId: string[]): Promise<void> {
		await interaction.reply(`You submitted the ${customId} modal.`);
	}
}

export default new ExampleModal();
