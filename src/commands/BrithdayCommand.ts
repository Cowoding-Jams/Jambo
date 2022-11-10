import {
	ChatInputCommandInteraction,
	SlashCommandBuilder,
	SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";
import { Command } from "../interactions/interactionClasses";
import { setCommand } from "../util/birthdayCommand/setCommand";
import { myCommand } from "../util/birthdayCommand/myCommand";
import { upcomingCommand } from "../util/birthdayCommand/upcomingCommand";
import { birthdayDb } from "../db";

const months = [
    {name:"January", value: "1"},
    {name:"Febuary", value: "2"},
    {name:"March", value: "3"},
    {name:"April", value: "4"},
    {name:"May", value: "5"},
    {name:"June", value: "6"},
    {name:"July", value: "7"},
    {name:"August", value: "8"},
    {name:"September", value: "9"},
    {name:"October", value: "10"},
    {name:"November", value: "11"},
    {name:"December", value: "12"}
]


class BirthdayCommand extends Command {
	constructor() {
		super("birthday");
	}

	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		await interaction.deferReply();
		const sub = interaction.options.getSubcommand();

		if (sub == "set") {
			await setCommand(interaction);
		} else if (sub == "my") {
			await myCommand(interaction);
		} else if (sub == "upcoming") {
			await upcomingCommand(interaction);
		} else if (sub == "temp") {
			birthdayDb.clear()
			await interaction.editReply("done")
		}
	}

	register():
		| SlashCommandBuilder
		| SlashCommandSubcommandsOnlyBuilder
		| Omit<SlashCommandBuilder, "addSubcommandGroup" | "addSubcommand"> {
		return new SlashCommandBuilder()
			.setName("birthday")
			.setDescription("Set your birthday so others can see when they need to congratulate you!")
			.addSubcommand(option => option.setName("temp").setDescription("Reset db"))
			.addSubcommand((option) =>
				option
                    // so, if date is march 1 and the current year is not divisible by 4, include those born on feb 29
					.setName("set")
					.setDescription(
						"Set the date of your birthday"
					)
					.addStringOption((opt) =>
						opt
							.setName("month")
							.setDescription("The Month of your Birthday")
                            .setChoices(...months)
					)
					.addIntegerOption((opt) =>
						opt
							.setName("day")
							.setDescription("The Day of your Birthday")
							.setMinValue(1)
							.setMaxValue(31)
					)
					.addBooleanOption((opt) => opt
						.setName("delete")
						.setDescription("Delete your Birthday entry")
					)
			)
			.addSubcommand((option) =>
				option.setName("my").setDescription("Show what date is stored for your birthday")
			)
			.addSubcommand((option) =>
				option.setName("upcoming").setDescription("Lists the upcoming birthdays in the next 30 days")
			);
	}
}

export default new BirthdayCommand();
