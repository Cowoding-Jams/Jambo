import { ButtonInteraction, CommandInteraction, Interaction } from "discord.js";
import { ctx } from "../ctx";
import { logger } from "../logger";

export default async function interactionCreate(interaction: Interaction) {
	if (interaction.isCommand()) {
		await handleCommandInteractions(interaction);
	} else if (interaction.isButton()) {
		await handleButtonInteractions(interaction);
	}
}

async function handleCommandInteractions(interaction: CommandInteraction) {
	const executedCommand = await ctx.commands.get(interaction.commandName)?.execute(interaction);
	if (!executedCommand) {
		logger.error(`error resolving command ${interaction.commandName}`);
		await interaction.reply("internal error resolving command");
	}
}

async function handleButtonInteractions(interaction: ButtonInteraction) {
	const clickedButton = await ctx.buttons.get(interaction.customId)?.execute(interaction);
	if (!clickedButton) {
		logger.error(`error resolving clicked button ${interaction.customId}`);
		await interaction.reply("internal error resolving button");
	}
}
