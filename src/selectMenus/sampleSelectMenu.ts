import { SelectMenuHandler } from "../handler";
import { SelectMenuInteraction } from "discord.js";

class ExampleSelectMenu extends SelectMenuHandler {
	constructor() {
		super("exampleSelectMenu");
	}

	async execute(interaction: SelectMenuInteraction, subcommand: string[]): Promise<void> {
		await interaction.reply(`You used ${subcommand} and selected the following options: ${interaction.values}`);
	}
}

export default new ExampleSelectMenu();