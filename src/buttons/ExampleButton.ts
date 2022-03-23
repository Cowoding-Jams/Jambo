import { ButtonHandler } from "../ButtonHandler";
import { ButtonInteraction } from "discord.js";

class ExampleButton extends ButtonHandler {
	constructor() {
		super("exampleButton");
	}

	async execute(interaction: ButtonInteraction): Promise<void> {
		await interaction.reply("example Message");
	}
}

export default new ExampleButton();
