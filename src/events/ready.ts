import { Client } from "discord.js";
import { ctx } from "../ctx";
import { logger } from "../logger";

export default async function ready(client: Client) {
	logger.info(`Successfully logged in as ${client.user?.username}.`);
	logger.info(`Watching over ${client.guilds.cache.size} guilds.`);

	logger.info("Publishing commands...");
	await publishCommands(client)
		.then(() => logger.info("Finished publishing commands."))
		.catch((err) => logger.error(err));

	logger.info("Setup successfully");
}

async function publishCommands(client: Client) {
	if (!client.application) {
		logger.error("client has no application");
		throw new Error("client must have an application");
	}
	const registeredCommands = await client.application.commands.fetch(undefined, { guildId: ctx.defaultGuild });

	await Promise.all(
		ctx.commands.map(async (cmd) => {
			const cmdJson = cmd.register().toJSON();
			const existingCmd = registeredCommands.find((c) => c.name === cmd.name);
			if (!existingCmd) {
				return client.application?.commands.create(cmdJson, ctx.defaultGuild);
			} else if (!commandsEqual(existingCmd, cmdJson)) {
				return client.application?.commands.edit(existingCmd.id, cmdJson, ctx.defaultGuild);
			}
		})
	);
}

function commandsEqual(c1: unknown, c2: unknown): boolean {
	// ts ignore is required, as the .toJSON() functions return a type unknown.
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	return (
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		c1.name === c2.name &&
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		c1.description === c2.description &&
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		JSON.stringify(c1.options) === JSON.stringify(c2.options)
	);
}
