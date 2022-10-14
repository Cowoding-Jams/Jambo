import { Modal } from "../interactions/interactionClasses";
import { ModalSubmitInteraction } from "discord.js";

class ExampleModal extends Modal {
	constructor() {
		super("exampleModal");
	}

	async execute(interaction: ModalSubmitInteraction, subcommand: string[]): Promise<void> {
		await interaction.reply(`You submitted the ${subcommand} modal.`);
	}
}

export default new ExampleModal();
