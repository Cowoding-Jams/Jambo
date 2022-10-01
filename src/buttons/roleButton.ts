import { ButtonHandler } from "../ButtonHandler";
import { ButtonInteraction } from "discord.js";

class RoleButton extends ButtonHandler {
	constructor() {
		super("role");
	}

	async execute(interaction: ButtonInteraction, args: string[]): Promise<void> {
		const id = args[0];

		await interaction.reply({ content: `${id}`, ephemeral: true });
	}
}

export default new RoleButton();
