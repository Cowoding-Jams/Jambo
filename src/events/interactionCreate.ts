import { ButtonInteraction, CommandInteraction, Interaction } from "discord.js";
import { ctx } from "../ctx";
import { logger } from "../logger";

export default async function interactionCreate(interaction: Interaction) {
	try {
		if (interaction.isCommand()) {
			await handleCommandInteractions(interaction);
		} else if (interaction.isButton()) {
			await handleButtonInteractions(interaction);
		}
	} catch (err: unknown) {
		if (err instanceof Error) {
			logger.error(`unhandled error occurred on interaction: ${err.name}`);
			logger.error(err.message);
			logger.error(err.stack);
		} else {
			logger.error(`unknown error occurred ${err}`);
		}
	}
}

async function handleCommandInteractions(interaction: CommandInteraction) {
	const command = ctx.commands.get(interaction.commandName);
	if (command) {
		await command.execute(interaction);
	} else {
		logger.error(`error resolving command ${interaction.commandName}`);
		await interaction.reply("An error occurred. Please contact a developer");
	}
}

async function handleButtonInteractions(interaction: ButtonInteraction) {
	const buttonName = interaction.customId.split(".")[0];
	const clickedButton = await ctx.buttons.get(buttonName);
	if (clickedButton) {
		await clickedButton.execute(interaction);
	} else {
		logger.error(`error resolving clicked button ${buttonName}`);
		await interaction.reply("An error occurred. Please contact a developer");
	}
}
