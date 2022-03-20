import { ButtonHandler } from "../ButtonHandler";
import { ButtonInteraction } from "discord.js";

class ExampleButton implements ButtonHandler {
	async execute(interaction: ButtonInteraction): Promise<void> {
		await interaction.reply("example Message");
	}

	getName(): string {
		return "exampleButton.myButton";
	}
}

export default new ExampleButton();
