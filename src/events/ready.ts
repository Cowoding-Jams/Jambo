import { Client, Collection } from "discord.js";
import { logger } from "../logger";
import { ctx } from "../ctx";

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
	const registeredCommands =
		(await client.application.commands.fetch(undefined, { guildId: ctx.defaultGuild })) || new Collection();

	await Promise.all(
		ctx.commands.map(async (cmd) => {
			const cmdJson = cmd.register().toJSON();
			const existingCmd = registeredCommands.find((c) => c.name === cmd.name);
			if (!existingCmd) {
				return client.application?.commands.create(cmdJson, ctx.defaultGuild);
			} else if (commandsEqual(existingCmd, cmdJson)) {
				console.log(cmdJson);
				console.log(existingCmd.toJSON());
				logger.info(cmdJson);
				logger.info(existingCmd.toJSON());
				return client.application?.commands.edit(existingCmd.id, cmdJson, ctx.defaultGuild);
			}
		})
	);
}

function commandsEqual(c1: unknown, c2: unknown): boolean {
	// ts ignore is required, as the .toJSON() functions return a type unknown.
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	return (c1.name === c2.name && c1.options === c2.options && c1.description === c2.description);
}
