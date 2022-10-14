import { ctx } from "./ctx";
import { logger } from "./logger";
import {
	AutocompleteInteraction,
	ButtonInteraction,
	ChatInputCommandInteraction,
	ModalSubmitInteraction,
	SelectMenuInteraction,
} from "discord.js";

export async function handleCommandInteractions(interaction: ChatInputCommandInteraction) {
	const command = ctx.commands.get(interaction.commandName);
	if (command) {
		await command.execute(interaction);
	} else {
		logger.error(`Error resolving command for: ${interaction.commandName}`);
		await interaction.reply({
			content: "An error occurred. Please contact a developer",
			ephemeral: true,
		});
	}
}

export async function handleButtonInteractions(interaction: ButtonInteraction) {
	const args = interaction.customId.split(".");
	const buttonName = args.shift() || "";
	const clickedButton = ctx.buttons.get(buttonName);
	if (clickedButton) {
		await clickedButton.execute(interaction, args);
	} else {
		logger.error(`Error resolving clicked button for: ${buttonName}`);
		await interaction.reply({
			content: "An error occurred. Please contact a developer",
			ephemeral: true,
		});
	}
}

export async function handleSelectMenuInteractions(interaction: SelectMenuInteraction) {
	const args = interaction.customId.split(".");
	const menuName = args.shift() || "";
	const selected = ctx.selectMenus.get(menuName);
	if (selected) {
		await selected.execute(interaction, args);
	} else {
		logger.error(`Error resolving select menu for: ${menuName}`);
		await interaction.reply({
			content: "An error occurred. Please contact a developer",
			ephemeral: true,
		});
	}
}

export async function handleModalInteractions(interaction: ModalSubmitInteraction) {
	const args = interaction.customId.split(".");
	const modalName = args.shift() || "";
	const selected = ctx.modals.get(modalName);
	if (selected) {
		await selected.execute(interaction, args);
	} else {
		logger.error(`Error resolving submitted modal for: ${modalName}`);
		await interaction.reply({
			content: "An error occurred. Please contact a developer",
			ephemeral: true,
		});
	}
}

export async function handleAutocompleteInteraction(interaction: AutocompleteInteraction) {
	const autocompleter = ctx.autocompleters.get(interaction.commandName);
	if (autocompleter) {
		await autocompleter.execute(interaction);
	} else {
		logger.error(`Error resolving autocompleter for: ${interaction.commandName}`);
		await interaction.respond([]);
	}
}
