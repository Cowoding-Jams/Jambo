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
			"This bot is in more than one guild... Remember that the bot will only work in one guild which is given in the .env file!"
		);

	logger.info(`Successfully logged in as ${client.user?.username}.`);
	logger.info(`Watching over ${guild.name}.`);

	client.user?.setStatus("online");
	client.user?.setActivity("you succeed :)", {
		type: ActivityType.Watching,
	});

	logger.debug("Publishing commands...");
	await client.application?.commands.set(
		ctx.commands.map((cmd) => cmd.register().toJSON()),
		ctx.defaultGuild
	);

	logger.debug("Starting coding-jam event scheduler...");
	CodingJamsCommand.startScheduler(client);

	logger.debug("Starting reminder scheduler...");
	ReminderCommand.startScheduler(client);

	logger.debug("Starting birthday scheduler...");
	BirthdayCommand.startScheduler(client);

	if (!guild.systemChannel) {
		logger.error(
			"There is no system channel configured which I need to send the birthday messages to... Please set one in the Discord settings!"
		);
	}

	logger.info("Setup successful!");

	if (!ctx.debugMode) {
		logger.debug("Validating config parameters...");
		await validateConfigParameters(guild);
		logger.debug("Config parameters validated!");
	}
}
