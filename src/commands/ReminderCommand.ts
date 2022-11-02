import { Command } from "../interactions/interactionClasses";
import {
	ChatInputCommandInteraction,
	Client,
	SlashCommandBuilder,
	SlashCommandIntegerOption,
	SlashCommandMentionableOption,
	SlashCommandStringOption,
	SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";
import { reminderDelete, reminderList, reminderSet } from "../util/reminderCommand/reminderSubcommands";
import { schedulerTick } from "../util/reminderCommand/reminderUtil";
import cron from "node-cron";

class ReminderCommand extends Command {
	constructor() {
		super("reminder");
	}

	startScheduler(client: Client) {
		schedulerTick(client);
		cron.schedule("*/30 * * * *", schedulerTick.bind(this, client));
	}

	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		const subcommand = interaction.options.getSubcommand();

		if (!interaction.guild) {
			await interaction.reply("This command can only be used inside a guild.");
			return;
		}

		switch (subcommand) {
			case "set": {
				reminderSet(interaction);
				break;
			}
			case "delete": {
				reminderDelete(interaction);
				break;
			}
			case "list": {
				reminderList(interaction);
				break;
			}
		}
	}

	register(): SlashCommandSubcommandsOnlyBuilder {
		return new SlashCommandBuilder()
			.setName("reminder")
			.setDescription("Reminds you after a certain amount of time has passed. (default: 20 minutes)")
			.addSubcommand((option) =>
				option
					.setName("set")
					.setDescription("Set a new reminder.")
					.addStringOption(message)
					.addStringOption(setDateIso)
					.addIntegerOption(setMonths)
					.addIntegerOption(setDays)
					.addIntegerOption(setHours)
					.addIntegerOption(setMinutes)
					.addStringOption(setDateUnix)
					.addMentionableOption(additionalPing)
			)
			.addSubcommand((option) =>
				option
					.setName("delete")
					.setDescription("Delete a reminder with its id.")
					.addIntegerOption((option) =>
						option
							.setName("id")
							.setDescription("ID of the reminder (autocompleted).")
							.setRequired(true)
							.setAutocomplete(true)
					)
			)
			.addSubcommand((option) =>
				option.setName("list").setDescription("Shows the list of active reminders.")
			);
	}
}

const setMinutes = new SlashCommandIntegerOption()
	.setName("minutes")
	.setDescription("Set the minutes. (60 seconds)")
	.setMinValue(0)
	.setMaxValue(1440)
	.setRequired(false);

const setHours = new SlashCommandIntegerOption()
	.setName("hours")
	.setDescription("Set the hours. (60 minutes)")
	.setMinValue(0)
	.setMaxValue(720)
	.setRequired(false);

const setDays = new SlashCommandIntegerOption()
	.setName("days")
	.setDescription("Set the days. (24 hours)")
	.setMinValue(0)
	.setMaxValue(365)
	.setRequired(false);

const setMonths = new SlashCommandIntegerOption()
	.setName("months")
	.setDescription("Set the months. (30 days)")
	.setMinValue(0)
	.setMaxValue(24)
	.setRequired(false);

const setDateIso = new SlashCommandStringOption()
	.setName("date-iso")
	.setDescription(
		"The date in ISO-8601. (e.g. '2003-05-26T04:48:33+02:00' or try '26 May 2003 04:48:33 UTC+2')"
	)
	.setRequired(false);

const setDateUnix = new SlashCommandStringOption()
	.setName("date-unix")
	.setDescription("The date with a unix timestamp. (e.g. '1053917313000')")
	.setRequired(false);

const additionalPing = new SlashCommandMentionableOption()
	.setName("additional-ping")
	.setDescription("Additional people or roles to ping.")
	.setRequired(false);

const message = new SlashCommandStringOption()
	.setName("message")
	.setDescription("The message to remind you.")
	.setRequired(false);

export default new ReminderCommand();
