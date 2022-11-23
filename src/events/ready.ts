import ReminderCommand from "../commands/ReminderCommand";
import { ActivityType, Client } from "discord.js";
import { ctx } from "../ctx";
import { logger } from "../logger";

export default async function ready(client: Client) {
	logger.info(`Successfully logged in as ${client.user?.username}.`);
	logger.info(`Watching over ${client.guilds.cache.size} guild(s).`);

	client.user?.setStatus("online");
	client.user?.setActivity("you succeed :)", {
		type: ActivityType.Watching,
	});

	logger.info("Publishing commands...");
	await client.application?.commands.set(ctx.commands.map((cmd) => cmd.register().toJSON()));

	logger.info("Starting reminder scheduler...");
	ReminderCommand.startScheduler(client);

	logger.info("Setup successfully!");
}
