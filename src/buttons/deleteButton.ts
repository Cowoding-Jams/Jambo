import { ButtonHandler } from "../handler";
import { ButtonInteraction } from "discord.js";

class DeleteButton extends ButtonHandler {
	constructor() {
		super("delete");
	}
	async execute(interaction: ButtonInteraction, args: string[]): Promise<void> {
		if (args[0] !== interaction.user.id)
			interaction.reply({ content: 'Only the "message Owner" can delete this message', ephemeral: true });
		else interaction.message.delete();
	}
}

export default new DeleteButton();
