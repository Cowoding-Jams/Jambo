import {
	ChatInputCommandInteraction,
	Client,
	SlashCommandBuilder,
	SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";
import cron from "node-cron";
import { config } from "../config.js";
import { birthdayDb } from "../db.js";
import { Command } from "../interactions/interactionClasses.js";
import { birthdayMessageTick } from "../util/birthday/loop.js";
import { getBirthday, setBirthday } from "../util/birthday/manageBirthday.js";
import { upcomingCommand } from "../util/birthday/upcomingCommand.js";

class BirthdayCommand extends Command {
	constructor() {
		super("birthday");
	}

	startScheduler(client: Client) {
		// Update all birthdays to the correct time
		for (const key of birthdayDb.keys()) {
			const date = birthdayDb.get(key)!;
			birthdayDb.set(
				key,
				date.set({ hour: config.birthdayNotificationAt, minute: 0, second: 0, millisecond: 0 })
			);
		}

		cron.schedule("0 * * * *", birthdayMessageTick.bind(this, client));
	}

	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		const sub = interaction.options.getSubcommand();

		if (sub == "set") {
			await setBirthday(interaction);
		} else if (sub == "get") {
			await getBirthday(interaction);
		} else if (sub == "upcoming") {
			await upcomingCommand(interaction);
		}
	}

	register(): SlashCommandSubcommandsOnlyBuilder {
		return new SlashCommandBuilder()
			.setName("birthday")
			.setDescription("Set your birthday so others can see when they need to congratulate you!")
			.addSubcommand((option) =>
				option
					.setName("set")
					.setDescription(
						"Set the date of your birthday. Make sure you have selected the correct timezone role!"
					)
					.addStringOption((opt) =>
						opt
							.setName("date")
							.setDescription(
								"The date of in the ISO format (e.g. '2003-05-26' year-month-day). The year '0000' ignores your age."
							)
							.setRequired(true)
					)
					.addBooleanOption((opt) => opt.setName("delete").setDescription("Delete your birthday entry."))
			)
			.addSubcommand((option) =>
				option
					.setName("get")
					.setDescription("Show what date is stored for a members birthday. (default: your own)")
					.addUserOption((opt) =>
						opt.setName("user").setDescription("The user to get the birthday of.").setRequired(false)
					)
			)
			.addSubcommand((option) =>
				option.setName("upcoming").setDescription("Lists the upcoming birthdays in the next 30 days.")
			);
	}
}

export default new BirthdayCommand();
