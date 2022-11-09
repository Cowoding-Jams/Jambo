import { SelectMenu } from "../interactions/interactionClasses";
import { SelectMenuInteraction } from "discord.js";

class ExampleSelectMenu extends SelectMenu {
	constructor() {
		super("exampleSelectMenu");
	}

	async execute(interaction: SelectMenuInteraction, customId: string[]): Promise<void> {
		await interaction.reply(`You used ${customId} and selected the following options: ${interaction.values}`);
	}
}

export default new ExampleSelectMenu();
