import { SelectMenuHandler } from "../handler";
import { SelectMenuInteraction } from "discord.js";

class ExampleSelectMenu extends SelectMenuHandler {
	constructor() {
		super("exampleSelectMenu");
	}

	async execute(interaction: SelectMenuInteraction, args: string[]): Promise<void> {
		await interaction.reply(`You selected the following options: ${interaction.values}`);
	}
}

export default new ExampleSelectMenu();
