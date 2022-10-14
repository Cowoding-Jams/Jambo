import { Command } from "../interactionClasses";
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
			.setDescription("A full featured poll system.")
			.addSubcommandGroup((group) =>
				group
					.setName("proposal")
					.setDescription("Manage proposals.")
					.addSubcommand((subcommand) =>
						subcommand
							.setName("create")
							.setDescription("Create a proposal.")
							.addStringOption(proposalTitleStringOption)
							.addStringOption(proposalDescriptionStringOption)
							.addStringOption(proposalTimePeriodStringOption)
					)
					.addSubcommand((subcommand) =>
						subcommand
							.setName("delete")
							.setDescription("Delete a proposal.")
							.addStringOption(proposalSelectStringOption)
					)
					.addSubcommand((subcommand) =>
						subcommand
							.setName("edit-proposal")
							.setDescription("Edit a proposals title, description or time period.")
							.addStringOption(proposalSelectStringOption)
							.addStringOption(proposalNewTitleStringOption)
							.addStringOption(proposalNewDescriptionStringOption)
							.addStringOption(proposalNewTimePeriodStringOption)
					)
			)
			.addSubcommandGroup((group) =>
				group
					.setName("create")
					.setDescription("Create polls.")
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
			)
			.addSubcommandGroup((group) =>
				group
					.setName("list")
					.setDescription("List proposals, polls, or templates.")
					.addSubcommand((subcommand) =>
						subcommand.setName("proposals").setDescription("Lists all the proposals.")
					)
					.addSubcommand((subcommand) =>
						subcommand.setName("templates").setDescription("Lists all the poll templates.")
					)
			);
	}
}

export default new PollCommand();

// Proposal creation
const proposalTitleStringOption = (option: SlashCommandStringOption) =>
	option.setName("title").setDescription("The title of the proposal.").setRequired(true);

const proposalDescriptionStringOption = (option: SlashCommandStringOption) =>
	option.setName("description").setDescription("The description of the proposal.").setRequired(true);

const proposalTimePeriodStringOption = (option: SlashCommandStringOption) =>
	option
		.setName("time-period")
		.setDescription("The time period for the jam. (Something like '24h', '4 days' or 'unsure')")
		.setRequired(true);

// Proposal edit
const proposalSelectStringOption = (option: SlashCommandStringOption) =>
	option
		.setName("title")
		.setDescription("The title of the proposal to select.")
		.setRequired(true)
		.setAutocomplete(true);

const proposalNewTitleStringOption = (option: SlashCommandStringOption) =>
	option.setName("new-title").setDescription("The new title of the proposal.").setRequired(false);

const proposalNewDescriptionStringOption = (option: SlashCommandStringOption) =>
	option.setName("new-description").setDescription("The new description of the proposal.").setRequired(false);

const proposalNewTimePeriodStringOption = (option: SlashCommandStringOption) =>
	option.setName("new-time-period").setDescription("The new time period of the proposal.").setRequired(false);

// Poll creation
const pollNameStringOption = (option: SlashCommandStringOption) =>
	option.setName("poll-name").setDescription("The name of the poll.").setRequired(true);

const pollTemplateNameStringOption = (option: SlashCommandStringOption) =>
	option.setName("template-name").setDescription("The name of the template for future reference.");

const pollTemplateSelectStringOption = (option: SlashCommandStringOption) =>
	option.setName("template-name").setDescription("The name of the template to use.").setRequired(true);
