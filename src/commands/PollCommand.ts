import { Command } from "../interactions/interactionClasses";
import {
	ChatInputCommandInteraction,
	SlashCommandBuilder,
	SlashCommandStringOption,
	SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";

class PollCommand extends Command {
	constructor() {
		super("poll");
	}

	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		await interaction.reply(interaction.options.getSubcommand());
	}

	register(): SlashCommandSubcommandsOnlyBuilder {
		return new SlashCommandBuilder()
			.setName("poll")
			.setDescription("A full featured poll system. (Meant to be used by members with elavated permissions)")
			.addSubcommandGroup((group) =>
				group
					.setName("manage")
					.setDescription("Manage polls.")
					.addSubcommand((subcommand) =>
						subcommand
							.setName("new")
							.setDescription("Create a new poll.")
							.addStringOption(pollNameStringOption)
					)
					.addSubcommand((subcommand) =>
						subcommand
							.setName("from-template")
							.setDescription("Create a poll from a template.")
							.addStringOption(pollNameStringOption)
							.addStringOption(pollTemplateSelectStringOption)
					)
					.addSubcommand((subcommand) =>
						subcommand
							.setName("new-template")
							.setDescription("Create a new poll template.")
							.addStringOption(pollTemplateNameStringOption)
					)
					.addSubcommand((subcommand) =>
						subcommand
							.setName("delete")
							.setDescription("Delete an existing poll.")
							.addStringOption(pollNameStringOption)
					)
			)
			.addSubcommandGroup((group) =>
				group
					.setName("list")
					.setDescription("List existing polls or templates.")
					.addSubcommand((subcommand) =>
						subcommand.setName("templates").setDescription("Lists all the poll templates.")
					)
					.addSubcommand((subcommand) => subcommand.setName("polls").setDescription("Lists all the polls."))
			);
	}
}

export default new PollCommand();

const pollNameStringOption = (option: SlashCommandStringOption) =>
	option.setName("poll-name").setDescription("The name of the poll.").setRequired(true);

const pollTemplateNameStringOption = (option: SlashCommandStringOption) =>
	option.setName("template-name").setDescription("The name of the template for future reference.");

const pollTemplateSelectStringOption = (option: SlashCommandStringOption) =>
	option.setName("template-name").setDescription("The name of the template to use.").setRequired(true);
