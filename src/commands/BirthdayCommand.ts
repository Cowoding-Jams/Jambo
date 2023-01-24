import {
	ChatInputCommandInteraction,
	Client,
	SlashCommandBuilder,
	SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";
import cron from "node-cron";
import { Command } from "../interactions/interactionClasses";
import { myBirthday, setBirthday } from "../util/birthdayCommand/manageBirthday";
import { upcomingCommand } from "../util/birthdayCommand/upcomingCommand";
import { birthdayMessageTick } from "../util/birthdayCommand/loop";
import { birthdayDb } from "../db";
import { config } from "../config";

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
		} else if (sub == "my") {
			await myBirthday(interaction);
		} else if (sub == "upcoming") {
			await upcomingCommand(interaction);
		}
	}

	register():
		| SlashCommandBuilder
		| SlashCommandSubcommandsOnlyBuilder
		| Omit<SlashCommandBuilder, "addSubcommandGroup" | "addSubcommand"> {
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
				option.setName("my").setDescription("Show what date is stored for your birthday.")
			)
			.addSubcommand((option) =>
				option.setName("upcoming").setDescription("Lists the upcoming birthdays in the next 30 days.")
			);
	}
}

export default new BirthdayCommand();
