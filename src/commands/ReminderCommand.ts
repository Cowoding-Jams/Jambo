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
import { reminderDelete, reminderList, reminderSet } from "../util/reminder/reminderSubcommands";
import { schedulerTick as reminderSchedulerTick } from "../util/reminder/reminderUtil";
import cron from "node-cron";

class ReminderCommand extends Command {
	constructor() {
		super("reminder");
	}

	startScheduler(client: Client) {
		reminderSchedulerTick(client);
		// every 30 minutes
		cron.schedule("*/30 * * * *", reminderSchedulerTick.bind(this, client));
	}

	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		const subcommand = interaction.options.getSubcommand();

		const commands: { [key: string]: (interaction: ChatInputCommandInteraction) => Promise<void> } = {
			set: reminderSet,
			delete: reminderDelete,
			list: reminderList,
		};

		await commands[subcommand](interaction);
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
					.addIntegerOption(setMinutes)
					.addIntegerOption(setHours)
					.addStringOption(setDateIso)
					.addStringOption(setDurationIso)
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
	.setDescription("Set the minutes.")
	.setMinValue(0)
	.setMaxValue(1440)
	.setRequired(false);

const setHours = new SlashCommandIntegerOption()
	.setName("hours")
	.setDescription("Set the hours.")
	.setMinValue(0)
	.setMaxValue(720)
	.setRequired(false);

const setDateIso = new SlashCommandStringOption()
	.setName("date-iso")
	.setDescription("The date in ISO-8601. (e.g. '2003-05-26T04:48:33+02:00', '2003-05-26T04' or '04:48:33')")
	.setRequired(false)
	.setAutocomplete(true);

const setDurationIso = new SlashCommandStringOption()
	.setName("duration-iso")
	.setDescription("The duration in ISO-8601. (e.g. 'P2DT3H20M')")
	.setRequired(false)
	.setAutocomplete(true);

const additionalPing = new SlashCommandMentionableOption()
	.setName("additional-ping")
	.setDescription("Additional people or roles to ping.")
	.setRequired(false);

const message = new SlashCommandStringOption()
	.setName("message")
	.setDescription("The message to remind you.")
	.setRequired(false);

export default new ReminderCommand();
