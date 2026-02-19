import { CommandInteraction } from "discord.js";
import { logger } from "../../logger.js";

export function unknownSubcommandReply(interaction: CommandInteraction) {
	logger.debug("Unknown subcommand");
	interaction.reply({
		content: "Sorry, I don't know what to do... I've never heard of that subcommand.",
		ephemeral: true,
	});
}

export function unknownSubcommandEdit(interaction: CommandInteraction) {
	logger.debug("Unknown subcommand");
	interaction.editReply({
		content: "Sorry, I don't know what to do... I've never heard of that subcommand.",
	});
}
