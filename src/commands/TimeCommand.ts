import { Command } from "../Command";
import { CommandInteraction } from "discord.js";
import {
	SlashCommandBooleanOption,
	SlashCommandBuilder,
	SlashCommandIntegerOption,
	SlashCommandSubcommandsOnlyBuilder,
} from "@discordjs/builders";

class Reminder extends Command {
	constructor() {
		super("reminder");
	}

	elapse(interaction: CommandInteraction, callAll: boolean, caller: string): void {
		if (callAll) {
			interaction.followUp("@everyone, Time's up!");
		} else {
			interaction.followUp("<@" + caller + ">! Time's up!");
		}
		this.m_id -= 1;
	}

	public rmdDatabase: NodeJS.Timeout[] = [];
	public timeList: boolean[] = [];
	public m_id = 0;

	async execute(interaction: CommandInteraction): Promise<void> {
		const subcommand = interaction.options.getSubcommand();

		//variables
		const second = interaction.options.getInteger("second") || 0;
		const minute = interaction.options.getInteger("minute") || 0;
		const hour = interaction.options.getInteger("hour") || 0;
		const callAll = interaction.options.getBoolean("callall") || false;
		const millisecond = (second + 60 * minute + 60 * 60 * hour) * 1000;
		const caller = interaction.user.id;
		const c_id = interaction.options.getInteger("id") || this.m_id - 1;

		switch (subcommand) {
			case "set":
				//call setTimeout
				this.rmdDatabase[this.m_id] = setTimeout(() => this.elapse(interaction, callAll, caller), millisecond);
				await interaction.reply(
					"Okay, I'll remind you soon~\nIn the event that you wish to no longer be reminded of this timer, use /reminder delete " +
						this.m_id.toString()
				);
				this.timeList[this.m_id] = true;
				this.m_id += 1;
				break;
			case "delete":
				//clear the reminder
				if (c_id >= this.m_id || c_id < 0) {
					await interaction.reply("The id does not exist.");
				} else {
					clearTimeout(this.rmdDatabase[c_id]);
					this.timeList[c_id] = false;
					await interaction.reply("I've removed the reminder :))");
					break;
				}
		}
	}

	register(): SlashCommandSubcommandsOnlyBuilder {
		return new SlashCommandBuilder()
			.setName("reminder")
			.setDescription("Reminds you (in specifically) after a certain amount of time has passed.")
			.addSubcommand((option) =>
				option
					.setName("set")
					.setDescription("Set a new reminder.")
					.addIntegerOption(setSecond)
					.addIntegerOption(setMinute)
					.addIntegerOption(setHour)
					.addBooleanOption(callAll)
			)
			.addSubcommand((option) =>
				option
					.setName("delete")
					.setDescription("Delete a reminder (with id).")
					.addIntegerOption((option) => option.setName("id").setDescription("ID of the reminder").setRequired(true))
			);
	}
}

const setSecond = new SlashCommandIntegerOption()
	.setName("second")
	.setDescription("Set for how many seconds (required field)")
	.setRequired(true);

const setMinute = new SlashCommandIntegerOption()
	.setName("minute")
	.setDescription("Set for how many minutes")
	.setRequired(false);

const setHour = new SlashCommandIntegerOption()
	.setName("hour")
	.setDescription("Set for how many hour")
	.setRequired(false);

const callAll = new SlashCommandBooleanOption()
	.setName("callall")
	.setDescription("whether or not to remind everyone")
	.setRequired(false);

export default new Reminder();
