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
