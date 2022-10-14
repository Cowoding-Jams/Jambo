import { Interaction } from "discord.js";
import { logger } from "../logger";
import {
	handleAutocompleteInteraction,
	handleButtonInteractions,
	handleCommandInteractions,
	handleModalInteractions,
	handleSelectMenuInteractions,
} from "../interactionHandler";

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
		} else if (interaction.isModalSubmit()) {
			await handleModalInteractions(interaction);
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
