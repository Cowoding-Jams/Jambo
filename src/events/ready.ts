import reminderCommand from "../commands/ReminderCommand";
import {
	ApplicationCommand,
	Client,
	SlashCommandBuilder,
	SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";
import { ctx } from "../ctx";
import { logger } from "../logger";

export default async function ready(client: Client) {
	logger.info(`Successfully logged in as ${client.user?.username}.`);
	logger.info(`Watching over ${client.guilds.cache.size} guilds.`);

	logger.info("Publishing commands...");
	await updateRegisteredCommands(client).then(() => logger.info("Finished publishing commands."));

	logger.info("Restoring reminders...");
	reminderCommand.restoreReminders();

	logger.info("Setup successfully");
}

async function updateRegisteredCommands(client: Client) {
	if (!client.application) {
		logger.error("Client has no application");
		throw new Error("Client must have an application");
	}
	const registeredCommands = await client.application.commands.fetch(undefined, {
		guildId: ctx.defaultGuild,
	});

	await Promise.all(
		ctx.commands.map(async (cmd) => {
			const cmdBuilder = cmd.register();
			const existingCmd = registeredCommands.find((c) => c.name === cmd.name);
			if (!existingCmd) {
				logger.debug(`Creating new command: ${cmdBuilder.name}`);
				return client.application?.commands.create(cmdBuilder.toJSON(), ctx.defaultGuild);
			} else if (!commandsEqual(existingCmd, cmdBuilder)) {
				logger.debug(`Updating command: ${cmdBuilder.name}`);
				return client.application?.commands.edit(existingCmd.id, cmdBuilder.toJSON(), ctx.defaultGuild);
			}
		})
	);
	for (const cmd of registeredCommands) {
		if (!ctx.commands.has(cmd[1].name)) {
			logger.debug(`Removing command: ${cmd[1]} with id ${cmd[0]}`);
			client.application?.commands.delete(cmd[0], ctx.defaultGuild);
		}
	}
}

function commandsEqual(
	c1: ApplicationCommand,
	c2:
		| SlashCommandBuilder
		| SlashCommandSubcommandsOnlyBuilder
		| Omit<SlashCommandBuilder, "addSubcommandGroup" | "addSubcommand">
): boolean {
	return (
		c1.name === c2.name &&
		c1.description === c2.description &&
		// this causes the bot to always update the country Command
		// the SlashCommandSubcommandsOnlyBuilder has no .options parameter
		JSON.stringify(c1.options) === JSON.stringify(c2.toJSON().options ?? [])
	);
}
