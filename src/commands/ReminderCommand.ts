import { Command } from "../Command";
import { CommandInteraction, TextBasedChannel } from "discord.js";
import {
	inlineCode,
	SlashCommandBooleanOption,
	SlashCommandBuilder,
	SlashCommandIntegerOption,
	SlashCommandStringOption,
	SlashCommandSubcommandsOnlyBuilder,
} from "@discordjs/builders";
import { timeDb } from "../db";

class ReminderCommand extends Command {
	constructor() {
		super("reminder");
	}

	private m_id = 0;

	async elapse(interaction: CommandInteraction, caller: string, message = ""): Promise<void> {
		const ch = (await interaction.client.channels.fetch(interaction.channelId)) as TextBasedChannel;
		await ch.send({
			content: `${caller == "-1" ? "@everyone" : `<@${caller}>`}, Time's up! Message: ${message}`,
		});
	}

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
				if (!interaction.guild) {
					await interaction.reply("This command can only be used inside a guild.");
					return;
				}
				const member = await interaction.guild.members.fetch(interaction.user);
				let i = interaction.user.id;
				if (callAll) {
					if (!member.permissions.has("MENTION_EVERYONE")) {
						await interaction.reply("You don't have the permission, sorry~");
						return;
					}
					i = (-1).toString();
				}
				//call setTimeout
				timeDb.set(this.m_id, {
					timeout: setTimeout(() => this.elapse(interaction, i, message), millisecond),
					destination: d,
					message: message,
				});

				await interaction.reply(
					`Okay, I'll remind you soon~~\nIn the event that you wish to no longer be reminded of this timer, use ${inlineCode(
						`/reminder delete ${this.m_id}`
					)}`
				);
				this.m_id += 1;
				break;
			}
			case "delete": {
				//variable
				const c_id = interaction.options.getInteger("id") || this.m_id - 1;
				//clear the reminder
				const item = timeDb.get(c_id);
				if (!item) {
					await interaction.reply("The id does not exist.");
					return;
				}
				clearTimeout(item.timeout);
				if (timeDb.delete(c_id)) {
					console.log("delete successful.");
				} else {
					console.log("something is wrong.");
				}
				await interaction.reply("I've removed the reminder :)");
				break;
			}
			case "list": {
				let output = "";
				let have = false;
				timeDb.forEach((value, key) => {
					let t = value.destination;
					if (t >= Date.now()) {
						t /= 1000;
						output =
							output +
							"ID = " +
							key.toString() +
							" | Time left = <t:" +
							t.toFixed(0).toString() +
							":R> | Message: " +
							value.message +
							"\n";
						have = true;
					} else {
						if (timeDb.delete(key)) {
							console.log("delete successful.");
						} else {
							console.log("something is wrong.");
						}
					}
				});
				if (!have) {
					await interaction.reply("The list is empty.");
				} else {
					await interaction.reply({
						content: output,
						allowedMentions: { users: [], roles: [] },
					});
				}
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

export default new ReminderCommand();
