import { StringSelectMenuInteraction } from "discord.js";
import { SelectMenu } from "../interactions/interactionClasses.js";

class ExampleSelectMenu extends SelectMenu {
	constructor() {
		super("exampleSelectMenu");
	}

	async execute(interaction: StringSelectMenuInteraction, customId: string[]): Promise<void> {
		await interaction.reply(`You used ${customId} and selected the following options: ${interaction.values}`);
	}
}

export default new ExampleSelectMenu();
