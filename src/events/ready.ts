import ReminderCommand from "../commands/ReminderCommand";
import { ActivityType, Client } from "discord.js";
import { ctx } from "../ctx";
import { logger } from "../logger";
import CodingJamsCommand from "../commands/CodingJamsCommand";
import { validateConfigParameters } from "../config-validate";
import BirthdayCommand from "../commands/BirthdayCommand";

export default async function ready(client: Client) {
	const guild = client.guilds.cache.get(ctx.defaultGuild)!;

	if (client.guilds.cache.size > 1)
		logger.warn(
			"This bot somehow is in more than one guild... That's not supported! Please remove it from all but one guild"
		);

	logger.info(`Successfully logged in as ${client.user?.username}.`);
	logger.info(`Watching over ${guild.name}.`);

	client.user?.setStatus("online");
	client.user?.setActivity("you succeed :)", {
		type: ActivityType.Watching,
	});

	logger.info("Publishing commands...");
	await client.application?.commands.set(ctx.commands.map((cmd) => cmd.register().toJSON()));

	logger.info("Starting coding-jam event scheduler...");
	CodingJamsCommand.startScheduler(client);

	logger.info("Starting reminder scheduler...");
	ReminderCommand.startScheduler(client);

	logger.info("Starting birthday scheduler...");
	BirthdayCommand.startScheduler(client);

	logger.info("Setup successful!");

	logger.debug("Validating config parameters...");
	await validateConfigParameters(guild);
	logger.debug("Config parameters validated!");
}
