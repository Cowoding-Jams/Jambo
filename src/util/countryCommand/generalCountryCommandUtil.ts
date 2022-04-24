import { CommandInteraction, ApplicationCommandOptionChoice } from "discord.js";

export function returnChoiceWithSameValues(e: string): ApplicationCommandOptionChoice {
	return { name: e, value: e };
}

export function handleUndefinedCountry(interaction: CommandInteraction) {
	interaction.reply({
		content: "I've never heard of that country... Next time pick one from the list, okay?",
		ephemeral: true,
	});
}
