import { ActivityType, Client, PresenceUpdateStatus } from "discord.js";
import BirthdayCommand from "../commands/BirthdayCommand.js";
import CodingJamsCommand from "../commands/CodingJamsCommand.js";
import ReminderCommand from "../commands/ReminderCommand.js";
import { validateConfigParameters } from "../config-validate.js";
import { ctx } from "../ctx.js";
import { logger } from "../logger.js";

export default async function ready(client: Client) {
	const guild = client.guilds.cache.get(ctx.defaultGuild)!;

	if (client.guilds.cache.size > 1)
		logger.warn(
			"This bot is in more than one guild... Remember that the bot will only work in one guild which is given in the .env file!"
		);

	logger.info(`Successfully logged in as ${client.user?.username}.`);
	logger.info(`Watching over ${guild.name}.`);

	client.user?.setPresence({
		status: PresenceUpdateStatus.Online,
		activities: [
			{
				name: "I believe in you :3",
				type: ActivityType.Custom,
			},
		],
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
