import {ButtonInteraction, CommandInteraction, Interaction} from "discord.js";
import {ctx} from "../ctx";

export default async function interactionCreate(interaction: Interaction) {
	if (interaction.isCommand()) {
		await handleCommandInteractions(interaction);
	} else if (interaction.isButton()) {
		await handleButtonInteractions(interaction);
	}
}

async function handleCommandInteractions(interaction: CommandInteraction) {
	await ctx.commands.get(interaction.commandName)?.execute(interaction);
}

async function handleButtonInteractions(interaction: ButtonInteraction) {
	ctx.buttons.get(interaction.customId)?.execute(interaction);
}
