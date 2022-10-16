import { Command } from "../interactions/interactionClasses";
import {
	ChatInputCommandInteraction,
	Client,
	EmbedBuilder,
	GuildMember,
	inlineCode,
	Role,
	SlashCommandBuilder,
	SlashCommandIntegerOption,
	SlashCommandMentionableOption,
	SlashCommandStringOption,
	SlashCommandSubcommandsOnlyBuilder,
	TextBasedChannel,
} from "discord.js";
import cron from "node-cron";
import { hasRoleMentionPerms } from "../util/misc/permissions";
import { addDefaultEmbedFooter } from "../util/misc/embeds";
import { reminderDb, reminderTimeoutCache } from "../db";
import { logger } from "../logger";

class ReminderCommand extends Command {
	constructor() {
		super("reminder");
	}

	async elapse(client: Client, id: number): Promise<void> {
		const reminder = reminderDb.get(id);
		if (!reminder) return;
		const channel = (await client.channels.fetch(reminder.channelID)) as TextBasedChannel;
		await channel?.send({
			content: reminder.pings.join(" "),
			embeds: [
				addDefaultEmbedFooter(
					new EmbedBuilder()
						.setTitle(`${reminder.pings.join(" ")} Time is up!`)
						.setDescription(reminder.message)
				),
			],
		});
		reminderDb.delete(id);
		reminderTimeoutCache.delete(id);
	}

	schedulerTick(client: Client) {
		try {
			reminderDb.forEach((reminder, id) => {
				if (!reminderTimeoutCache.has(id) && reminder.timestamp <= Date.now() + 30 * 60 * 1000) {
					reminderTimeoutCache.set(
						id,
						setTimeout(() => this.elapse(client, id), reminder.timestamp - Date.now())
					);
				}
			});
		} catch (e) {
			logger.error("Error in reminder scheduler tick", e);
		}
	}

	startScheduler(client: Client) {
		this.schedulerTick(client);
		cron.schedule("*/30 * * * *", this.schedulerTick.bind(this, client));
	}

	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		const subcommand = interaction.options.getSubcommand();

		if (!interaction.guild) {
			await interaction.reply("This command can only be used inside a guild.");
			return;
		}

		switch (subcommand) {
			case "set": {
				const minutes = interaction.options.getInteger("minutes") || 0;
				const hours = interaction.options.getInteger("hours") || 0;
				const days = interaction.options.getInteger("days") || 0;
				const months = interaction.options.getInteger("months") || 0;

				const dateIso = Date.parse(interaction.options.getString("date-iso") || "error");
				const dateUnix = new Date(
					parseInt(interaction.options.getString("date-unix") || "error") * 1000
				).getTime();

				const message = interaction.options.getString("message") || "";
				const additionalPing = interaction.options.getMentionable("additional-ping") as
					| GuildMember
					| Role
					| null;

				const milliseconds = (minutes + 60 * hours + 60 * 24 * days + 60 * 24 * 30 * months) * 1000 * 60;
				let timestamp: number;
				if (dateIso) {
					timestamp = dateIso;
				} else if (dateUnix) {
					timestamp = dateUnix;
				} else if (milliseconds != 0) {
					timestamp = Date.now() + milliseconds;
				} else {
					timestamp = Date.now() + 20 * 60 * 1000; // defaults to 10 minutes
				}

				if (additionalPing instanceof Role && !(await hasRoleMentionPerms(interaction, additionalPing))) {
					await interaction.reply({
						content: "You don't have the permission to ping that role.",
						ephemeral: true,
					});
					return;
				}

				if (!interaction.channel) {
					await interaction.reply({
						content: "You can only use this command in a text channel.",
						ephemeral: true,
					});
					return;
				}

				const member = await interaction.guild.members.fetch(interaction.user);

				const id = reminderDb.autonum;
				reminderDb.set(id, {
					timestamp: timestamp,
					message: message,
					channelID: interaction.channel.id,
					pings: [member.toString(), additionalPing?.toString() ?? ""],
				});

				if (timestamp <= Date.now() + 30 * 60 * 1000)
					reminderTimeoutCache.set(
						id,
						setTimeout(() => this.elapse(interaction.client, id), milliseconds)
					);

				timestamp -= Date.now();
				timestamp /= 1000 * 60; // relative time in minutes
				const _months = Math.floor(timestamp / (60 * 24 * 30));
				timestamp = timestamp % (60 * 24 * 30);
				const _days = Math.floor(timestamp / (60 * 24));
				timestamp = timestamp % (60 * 24);
				const _hours = Math.floor(timestamp / 60);
				timestamp = timestamp % 60;
				const _minutes = Math.round(timestamp * 100) / 100;

				await interaction.reply({
					embeds: [
						addDefaultEmbedFooter(
							new EmbedBuilder()
								.setTitle("Reminder set!")
								.setDescription(
									`I will remind you in ${_months == 0 ? "" : ` ${_months} months`}${
										_days == 0 ? "" : ` ${_days} days`
									}${_hours == 0 ? "" : ` ${_hours} hours`}${_minutes == 0 ? "" : ` ${_minutes} minutes`}!${
										message == "" ? "" : `\nWith the message: ${message}`
									} \nYou can always delete this reminder with ${inlineCode(`/reminder delete ${id}`)}`
								)
						),
					],
				});
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

				if (member.toString() === item.pings[0]) {
					reminderDb.delete(c_id);
					if (reminderTimeoutCache.has(c_id)) {
						clearTimeout(reminderTimeoutCache.get(c_id));
						reminderTimeoutCache.delete(c_id);
					}
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

					if (value.pings[0] === member.toString()) {
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
			.setDescription("Reminds you after a certain amount of time has passed. (default: 20 minutes)")
			.addSubcommand((option) =>
				option
					.setName("set")
					.setDescription("Set a new reminder.")
					.addStringOption(message)
					.addStringOption(setDateIso)
					.addIntegerOption(setMinutes)
					.addIntegerOption(setHours)
					.addIntegerOption(setDays)
					.addIntegerOption(setMonths)
					.addStringOption(setDateUnix)
					.addMentionableOption(additionalPing)
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
	.setDescription("Set the absolute date in the ISO 8601 format. (e.g. '26 May 2003 04:48:33 UTC+2')")
	.setRequired(false);

const setDateUnix = new SlashCommandStringOption()
	.setName("date-unix")
	.setDescription("Set the absolute date with a unix timestamp. (e.g. '1053917313000')")
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
