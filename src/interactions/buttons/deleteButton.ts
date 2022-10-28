import { Button } from "../interactionClasses";
import { ButtonInteraction } from "discord.js";

class DeleteButton extends Button {
	constructor() {
		super("delete");
	}
	async execute(interaction: ButtonInteraction, args: string[]): Promise<void> {
		if (args[0] == "*") {
			await interaction.message.delete();
			return;
		}

		if (args[0] !== interaction.user.id)
			interaction.reply({
				content: "Only the original creator of this interaction can delete this message",
				ephemeral: true,
			});
		else interaction.message.delete();
	}
}

export default new DeleteButton();
