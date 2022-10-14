import { Command } from "../interactions/interactionClasses";
import {
	ChatInputCommandInteraction,
	Client,
	inlineCode,
	SlashCommandBooleanOption,
	SlashCommandBuilder,
	SlashCommandIntegerOption,
	SlashCommandStringOption,
	SlashCommandSubcommandsOnlyBuilder,
	TextBasedChannel,
} from "discord.js";
import { reminderDb, reminderTimeoutCache } from "../db";
import { hasMentionEveryonePerms } from "../util/misc/permissions";

class ReminderCommand extends Command {
	constructor() {
		super("reminder");
	}

	async elapse(client: Client, id: number): Promise<void> {
		const reminder = reminderDb.get(id);
		if (!reminder) return;
		const ch = (await client.channels.fetch(reminder.channel)) as TextBasedChannel;
		await ch.send({
			content: `${reminder.callAll ? "<@everyone>" : `<@${reminder.user}>`} Time's up! ${reminder.message}`,
		});
		reminderDb.delete(id);
		reminderTimeoutCache.delete(id);
	}

	restoreReminders(client: Client) {
		reminderDb.forEach((reminder, id) => {
			reminderTimeoutCache.set(
				id,
				setTimeout(() => this.elapse(client, id), reminder.timestamp - Date.now())
			);
		});
	}

	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		const subcommand = interaction.options.getSubcommand();

		if (!interaction.guild) {
			await interaction.reply("This command can only be used inside a guild.");
			return;
		}

		switch (subcommand) {
			case "set": {
				//default 10 minutes
				const second = interaction.options.getInteger("seconds") || 0;
				let minute = interaction.options.getInteger("minutes") || 0;
				const hour = interaction.options.getInteger("hours") || 0;
				const message = interaction.options.getString("message") || "";
				const callAll = interaction.options.getBoolean("callall") || false;
				let millisecond = (second + 60 * minute + 60 * 60 * hour) * 1000;
				if (millisecond == 0) {
					// defaults to 10 minutes
					millisecond = 10 * 60 * 1000;
					minute = 10;
				}

				const timestamp = Date.now() + millisecond;

				const member = await interaction.guild.members.fetch(interaction.user);

				if (callAll && !(await hasMentionEveryonePerms(interaction))) return;

				const id = reminderDb.autonum;
				reminderDb.set(id, {
					timestamp,
					message: message,
					channel: interaction.channelId,
					user: member.id,
					callAll,
				});
				reminderTimeoutCache.set(
					id,
					setTimeout(() => this.elapse(interaction.client, id), millisecond)
				);

				await interaction.reply(
					`Okay, I'll remind you in${hour == 0 ? "" : ` ${hour} hours`}${
						minute == 0 ? "" : ` ${minute} minutes`
					}${second == 0 ? "" : ` ${second} seconds`}${
						message == "" ? "" : ` with the following message: ${message}`
					} \nYou can always delete this reminder with ${inlineCode(`/reminder delete ${id}`)}`
				);
				break;
			}

			case "delete": {
				const c_id = interaction.options.getInteger("id", true);
				const member = await interaction.guild.members.fetch(interaction.user);

				const item = reminderDb.get(c_id);
				if (!item) {
					await interaction.reply({ content: "The id does not exist.", ephemeral: true });
					return;
				}

				if (member.id == item.user) {
					clearTimeout(reminderTimeoutCache.get(c_id));
					reminderDb.delete(c_id);
					reminderTimeoutCache.delete(c_id);
					await interaction.reply({ content: "I've removed the reminder :)", ephemeral: true });
				} else {
					await interaction.reply({ content: "You can only delete your own reminders.", ephemeral: true });
				}
				break;
			}

			case "list": {
				const member = await interaction.guild.members.fetch(interaction.user);
				let output = "";

				reminderDb.forEach((value, key) => {
					const time = (value.timestamp / 1000).toFixed(0);

					if (value.user == member.id || value.callAll) {
						output += `ID: ${key} | Time left: <t:${time}:R> ${
							value.message == "" ? "" : `| ${value.message}`
						}\n`;
					}
				});

				if (output == "") {
					await interaction.reply({
						content: "The list is empty. You don't have any active reminders.",
						ephemeral: true,
					});
				} else {
					await interaction.reply({
						content: output,
						ephemeral: true,
					});
				}
				break;
			}
		}
	}

	register(): SlashCommandSubcommandsOnlyBuilder {
		return new SlashCommandBuilder()
			.setName("reminder")
			.setDescription("Reminds you after a certain amount of time has passed.")
			.addSubcommand((option) =>
				option
					.setName("set")
					.setDescription("Set a new reminder.")
					.addStringOption(message)
					.addIntegerOption(setSecond)
					.addIntegerOption(setMinute)
					.addIntegerOption(setHour)
					.addBooleanOption(callAll)
			)
			.addSubcommand((option) =>
				option
					.setName("delete")
					.setDescription("Delete a reminder with its id.")
					.addIntegerOption((option) =>
						option.setName("id").setDescription("ID of the reminder").setRequired(true)
					)
			)
			.addSubcommand((option) =>
				option.setName("list").setDescription("Shows the list of active reminders.")
			);
	}
}

const setSecond = new SlashCommandIntegerOption()
	.setName("seconds")
	.setDescription("Set the seconds.")
	.setRequired(false);

const setMinute = new SlashCommandIntegerOption()
	.setName("minutes")
	.setDescription("Set the minutes.")
	.setRequired(false);

const setHour = new SlashCommandIntegerOption()
	.setName("hours")
	.setDescription("Set the hours.")
	.setRequired(false);

const callAll = new SlashCommandBooleanOption()
	.setName("callall")
	.setDescription("Whether or not to remind everyone.")
	.setRequired(false);

const message = new SlashCommandStringOption()
	.setName("message")
	.setDescription("The reminder's message.")
	.setRequired(false);

export default new ReminderCommand();
