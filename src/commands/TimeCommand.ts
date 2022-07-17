import { Command } from "../Command";
import { CommandInteraction, GuildMember } from "discord.js";
import {
	SlashCommandBooleanOption,
	SlashCommandBuilder,
	SlashCommandIntegerOption,
	SlashCommandStringOption,
	SlashCommandSubcommandsOnlyBuilder,
} from "@discordjs/builders";

class Reminder extends Command {
	constructor() {
		super("reminder");
	}

	elapse(interaction: CommandInteraction, callAll: boolean, caller: string, message = ""): void {
		if (callAll) {
			interaction.followUp("@everyone, Time's up!");
		} else {
			interaction.followUp("<@!" + caller + "> Time's up!");
		}
		if (message != "") {
			interaction.followUp("Message: " + message);
		}
		this.m_id -= 1;
	}

	private rmdDatabase: {
		id: number;
		timeout: NodeJS.Timeout;
		destination: number;
		message: string;
		active: boolean;
	}[] = [];
	private m_id = 0;

	async execute(interaction: CommandInteraction): Promise<void> {
		const subcommand = interaction.options.getSubcommand();
		switch (subcommand) {
			case "set": {
				//variables
				const second = interaction.options.getInteger("second") || 0;
				const minute = interaction.options.getInteger("minute") || 0;
				const hour = interaction.options.getInteger("hour") || 0;
				const message = interaction.options.getString("message") || "";
				const callAll = interaction.options.getBoolean("callall") || false;
				const millisecond = (second + 60 * minute + 60 * 60 * hour) * 1000;
				const d = Date.now() + millisecond;
				const member = interaction.member as GuildMember;
				if (callAll) {
					if (!member.permissions.has("ADMINISTRATOR")) {
						await interaction.reply("You don't have the permission, sorry~");
						break;
					}
				}
				//call setTimeout
				this.rmdDatabase[this.m_id] = {
					id: this.m_id,
					timeout: setTimeout(() => this.elapse(interaction, callAll, interaction.user.id, message), millisecond),
					destination: d,
					message: message,
					active: true,
				};
				await interaction.reply(
					"Okay, I'll remind you soon~\nIn the event that you wish to no longer be reminded of this timer, use /reminder " +
						this.rmdDatabase[this.m_id].id
				);
				this.m_id += 1;
				break;
			}
			case "delete": {
				//variable
				const c_id = interaction.options.getInteger("id") || this.m_id - 1;
				//clear the reminder
				if (c_id >= this.m_id || c_id < 0) {
					await interaction.reply("The id does not exist.");
				} else {
					clearTimeout(this.rmdDatabase[c_id].timeout);
					await interaction.reply("I've removed the reminder :))");
					this.rmdDatabase[c_id].active = false;
				}
				break;
			}
			case "list": {
				let output = "";
				for (const i of this.rmdDatabase) {
					if (i.active) {
						const t = i.destination / 1000;
						output =
							output +
							"ID = " +
							i.id.toString() +
							" | Time left = <t:" +
							t.toFixed(0).toString() +
							":R> | Message: " +
							i.message +
							"\n";
					}
				}
				await interaction.reply(output);
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
					.addStringOption(message)
					.addBooleanOption(callAll)
			)
			.addSubcommand((option) =>
				option
					.setName("delete")
					.setDescription("Delete a reminder (with id).")
					.addIntegerOption((option) => option.setName("id").setDescription("ID of the reminder").setRequired(true))
			)
			.addSubcommand((option) =>
				option.setName("list").setDescription("Show the current list of available reminders.")
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
	.setDescription("Whether or not to remind everyone")
	.setRequired(false);

const message = new SlashCommandStringOption()
	.setName("message")
	.setDescription("The reminder's message")
	.setRequired(false);

export default new Reminder();
