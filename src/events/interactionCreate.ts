import {
	AutocompleteInteraction,
	ButtonInteraction,
	ChatInputCommandInteraction,
	Interaction,
	SelectMenuInteraction,
} from "discord.js";
import { logger } from "../logger";
import { ctx } from "../ctx";

export default async function interactionCreate(interaction: Interaction) {
	try {
		if (interaction.isChatInputCommand()) {
			await handleCommandInteractions(interaction);
		} else if (interaction.isButton()) {
			await handleButtonInteractions(interaction);
		} else if (interaction.isAutocomplete()) {
			await handleAutocompleteInteraction(interaction);
		} else if (interaction.isSelectMenu()) {
			await handleSelectMenuInteractions(interaction);
		}
	} catch (err: unknown) {
		if (err instanceof Error) {
			logger.error(`Unhandled error occurred on interaction: ${err.name}`);
			logger.error(err.message);
			logger.error(err.stack);
		} else {
			logger.error(`Unknown error occurred ${err}`);
		}
	}
}

async function handleCommandInteractions(interaction: ChatInputCommandInteraction) {
	const command = ctx.commands.get(interaction.commandName);
	if (command) {
		await command.execute(interaction);
	} else {
		logger.error(`Error resolving command ${interaction.commandName}`);
		await interaction.reply("An error occurred. Please contact a developer");
	}
}

async function handleButtonInteractions(interaction: ButtonInteraction) {
	const args = interaction.customId.split(".");
	const buttonName = args.shift() || "";
	const clickedButton = ctx.buttons.get(buttonName);
	if (clickedButton) {
		await clickedButton.execute(interaction, args);
	} else {
		logger.error(`Error resolving clicked button ${buttonName}`);
		await interaction.reply("An error occurred. Please contact a developer");
	}
}

async function handleSelectMenuInteractions(interaction: SelectMenuInteraction) {
	const args = interaction.customId.split(".");
	const menuName = args.shift() || "";
	const selected = ctx.selectMenus.get(menuName);
	if (selected) {
		await selected.execute(interaction, args);
	} else {
		logger.error(`Error resolving select menu for: ${menuName}`);
		await interaction.reply("An error occurred. Please contact a developer");
	}
}

async function handleAutocompleteInteraction(interaction: AutocompleteInteraction) {
	const autocompleter = ctx.autocompleters.get(interaction.commandName);
	if (autocompleter) {
		await autocompleter.execute(interaction);
	} else {
		logger.error(`Error resolving autocompleter for ${interaction.commandName}`);
		await interaction.respond([]);
	}
}
