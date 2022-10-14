import { Button } from "../../interactionClasses";
import { ButtonInteraction, inlineCode, Message } from "discord.js";
import { latexDb } from "../../db";

class LatexButton extends Button {
	constructor() {
		super("latex");
	}

	async execute(interaction: ButtonInteraction, args: string[]): Promise<void> {
		const id = args[0];

		let input = await latexDb.get(interaction.message.id);
		latexDb.delete(interaction.message.id);

		input = input ? inlineCode(input) : "No data availabe...";

		if (id == "delete") {
			if (interaction.message.interaction?.user.id == interaction.user.id) {
				(interaction.message as Message).delete();
				interaction.reply({ content: "Code: " + input, ephemeral: true });
			} else {
				const content =
					"Only the author of the command can delete this message... \nHere is the code though: " +
					input +
					" :)";
				interaction.reply({ content: content, ephemeral: true });
			}
		}
	}
}

export default new LatexButton();
