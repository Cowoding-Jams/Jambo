import { Client } from "discord.js";
import { logger } from "../logger";
import { ctx } from "../ctx";

export default async function ready(client: Client) {
	logger.info(`Successfully logged in as ${client.user?.username}.`);
	logger.info(`Watching over ${client.guilds.cache.size} guilds.`);

	logger.info("Publishing commands...");
	(await client.guilds.fetch(ctx.defaultGuild)).commands
		.set([...ctx.commands.values()].map((cmd) => cmd.register(client).toJSON()))
		.then(() => logger.info("Finished publishing commands."))
		.catch((err) => logger.error(err));
}
