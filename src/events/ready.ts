import { SlashCommandBuilder } from "@discordjs/builders";
import { ApplicationCommand, Client } from "discord.js";
import { ctx } from "../ctx";
import { logger } from "../logger";

export default async function ready(client: Client) {
	logger.info(`Successfully logged in as ${client.user?.username}.`);
	logger.info(`Watching over ${client.guilds.cache.size} guilds.`);

	logger.info("Publishing commands...");
	await updateRegisteredCommands(client).then(() => logger.info("Finished publishing commands."));

	logger.info("Setup successfully");
}

async function updateRegisteredCommands(client: Client) {
	if (!client.application) {
		logger.error("client has no application");
		throw new Error("client must have an application");
	}
	const registeredCommands = await client.application.commands.fetch(undefined, { guildId: ctx.defaultGuild });

	await Promise.all(
		ctx.commands.map(async (cmd) => {
			const cmdBuilder = cmd.register();
			const existingCmd = registeredCommands.find((c) => c.name === cmd.name);
			if (!existingCmd) {
				logger.debug(`creating new command: ${cmdBuilder.name}`);
				return client.application?.commands.create(cmdBuilder.toJSON(), ctx.defaultGuild);
			} else if (!commandsEqual(existingCmd, cmdBuilder)) {
				logger.debug(`updating command: ${cmdBuilder.name}`);
				return client.application?.commands.edit(existingCmd.id, cmdBuilder.toJSON(), ctx.defaultGuild);
			}
		})
	);
	for (const cmd of registeredCommands) {
		if (!ctx.commands.has(cmd[1].name)) {
			logger.debug(`removing command: ${cmd[1]} with id ${cmd[0]}`);
			client.application?.commands.delete(cmd[0], ctx.defaultGuild);
		}
	}
}

function commandsEqual(c1: ApplicationCommand, c2: SlashCommandBuilder): boolean {
	return (
		c1.name === c2.name &&
		c1.description === c2.description &&
		JSON.stringify(c1.options) === JSON.stringify(c2.options)
	);
}
