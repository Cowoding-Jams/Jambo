import { ButtonHandler } from "../ButtonHandler";
import { ButtonInteraction } from "discord.js";

class ExampleButton extends ButtonHandler {
	constructor() {
		super("exampleButton");
	}

	async execute(interaction: ButtonInteraction, args: string[]): Promise<void> {
		await interaction.reply(`you selected the following options: ${args}`);
	}
}

export default new ExampleButton();
