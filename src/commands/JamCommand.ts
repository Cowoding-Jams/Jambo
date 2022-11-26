import { Command } from "../interactions/interactionClasses";
import {
	ChatInputCommandInteraction,
	SlashCommandBuilder,
	SlashCommandIntegerOption,
	SlashCommandStringOption,
	SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";
import { hasAdminPerms } from "../util/misc/permissions";
import { deleteJam, editJam, newJam } from "../util/jamCommand/manageJams";
import { deletePoll, editPoll, newPoll } from "../util/pollCommand/managePolls";

class PollCommand extends Command {
	constructor() {
		super("coding-jams");
	}

	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		if (!(await hasAdminPerms(interaction))) {
			await interaction.reply({
				content: "The coding jam commands are meant to be used by admins only.",
				ephemeral: true,
			});
			return;
		}

		const subCmdGroup = interaction.options.getSubcommandGroup() || "cmd";
		const subCmd = interaction.options.getSubcommand();

		const commands: {
			[key: string]: { [key: string]: (interaction: ChatInputCommandInteraction) => Promise<void> };
		} = {
			jam: {
				new: newJam,
				edit: editJam,
				delete: deleteJam,
			},
			poll: {
				new: newPoll,
				edit: editPoll,
				delete: deletePoll,
			},
			cmd: {},
		};

		await interaction.deferReply({ ephemeral: true });
		await commands[subCmdGroup][subCmd](interaction);
	}

	register(): SlashCommandSubcommandsOnlyBuilder {
		return new SlashCommandBuilder()
			.setName("coding-jams")
			.setDescription("A full featured system to manage the coding jams. (admins/mods only)")
			.addSubcommandGroup((group) =>
				group
					.setName("poll")
					.setDescription("Manage the polls.")
					.addSubcommand((subcommand) =>
						subcommand
							.setName("new")
							.setDescription("Create a new poll.")
							.addStringOption(pollNameStringOption)
							.addIntegerOption(pollProposalsIntegerOption)
							.addIntegerOption(pollVotesIntegerOption)
							.addStringOption(pollSelectionStringOption)
							.addStringOption(startDateStringOption)
							.addStringOption(endDateStringOption)
							.addStringOption(durationStringOption)
							.addStringOption(pollIncludeSpecificProposalsStringOption)
							.addStringOption(pollExcludeSpecificProposalsStringOption)
					)
					.addSubcommand((subcommand) =>
						subcommand
							.setName("extend")
							.setDescription("Extend a running poll in its length.")
							.addStringOption(pollNameStringOption.setAutocomplete(true))
							.addStringOption(endDateStringOption)
							.addStringOption(durationStringOption)
					)
					.addSubcommand((subcommand) =>
						subcommand
							.setName("delete")
							.setDescription("Delete an existing poll.")
							.addStringOption(pollNameStringOption.setAutocomplete(true))
					)
			)
			.addSubcommandGroup((group) =>
				group
					.setName("jam")
					.setDescription("Manage the jams.")
					.addSubcommand((subcommand) =>
						subcommand
							.setName("new")
							.setDescription("Create a new jam.")
							.addStringOption(jamNameStringOption)
							.addStringOption(jamProposalNameStringOption)
							.addStringOption(startDateStringOption)
							.addStringOption(endDateStringOption)
							.addStringOption(durationStringOption)
					)
					.addSubcommand((subcommand) =>
						subcommand
							.setName("extend")
							.setDescription("Extend a running Jam in its length.")
							.addStringOption(jamNameStringOption.setAutocomplete(true))
							.addStringOption(endDateStringOption)
							.addStringOption(durationStringOption)
					)
					.addSubcommand((subcommand) =>
						subcommand
							.setName("delete")
							.setDescription("Delete an existing jam.")
							.addStringOption(jamNameStringOption.setAutocomplete(true))
					)
			)
			.addSubcommandGroup((group) =>
				group
					.setName("list")
					.setDescription("List existing polls or jams.")
					.addSubcommand((subcommand) => subcommand.setName("jams").setDescription("Lists all the jams."))
					.addSubcommand((subcommand) => subcommand.setName("polls").setDescription("Lists all the polls."))
			);
	}
}

export default new PollCommand();

// Polls
const pollNameStringOption = new SlashCommandStringOption()
	.setName("name")
	.setDescription("The name of the poll.")
	.setRequired(true);

const pollVotesIntegerOption = new SlashCommandIntegerOption()
	.setName("num-votes")
	.setDescription("Number of votes for every person. ('proposals' > 'votes')")
	.setRequired(true)
	.setMinValue(2)
	.setMaxValue(40);

const pollProposalsIntegerOption = new SlashCommandIntegerOption()
	.setName("num-proposals")
	.setDescription("Number of proposals to vote. ('proposals' > 'votes')")
	.setRequired(true)
	.setMinValue(2)
	.setMaxValue(40);

export const pollSelectionRandom = "random";
export const pollSelectionTop = "top";
export const pollSelectionBottom = "bottom";
export const pollSelectionTopAll = "topAll";
export const pollSelectionBottomAll = "bottomAll";
export const pollSelectionNewest = "newest";
export const pollSelectionOldest = "oldest";

const pollSelectionStringOption = new SlashCommandStringOption()
	.setName("proposal-selection-type")
	.setDescription("Determins which proposals will be selected for voting.")
	.setRequired(true)
	.addChoices(
		{ name: "Top (last time)", value: pollSelectionTop },
		{ name: "Bottom (last time)", value: pollSelectionBottom },
		{ name: "Random", value: pollSelectionRandom },
		{ name: "Newest", value: pollSelectionNewest },
		{ name: "Oldest", value: pollSelectionOldest },
		{ name: "Top-All (all time)", value: pollSelectionTopAll },
		{ name: "Bottom-All (all time)", value: pollSelectionBottomAll }
	);

const pollIncludeSpecificProposalsStringOption = new SlashCommandStringOption()
	.setName("include-proposals")
	.setDescription(
		"Lets you enter specific proposals you want included in the poll. (follow the autocomplete!)"
	)
	.setRequired(false)
	.setAutocomplete(true);

const pollExcludeSpecificProposalsStringOption = new SlashCommandStringOption()
	.setName("exclude-proposals")
	.setDescription(
		"Lets you enter specific proposals you want to exclude from the poll. (follow the autocomplete!)"
	)
	.setRequired(false)
	.setAutocomplete(true);

// Jams
const jamNameStringOption = new SlashCommandStringOption()
	.setName("name")
	.setDescription("The name of the jam.")
	.setRequired(true);

const jamProposalNameStringOption = new SlashCommandStringOption()
	.setName("proposal")
	.setDescription("Select the name of the proposal for this jam.")
	.setRequired(true)
	.setAutocomplete(true);

// MISC
const startDateStringOption = new SlashCommandStringOption()
	.setName("start-date")
	.setDescription("Set the start date in the ISO format.")
	.setRequired(true);

const endDateStringOption = new SlashCommandStringOption()
	.setName("end-date")
	.setDescription("Set the end date in the ISO format. (alternative to 'duration')")
	.setRequired(false);

const durationStringOption = new SlashCommandStringOption()
	.setName("duration")
	.setDescription("Set the duration in the ISO format. (alternative to 'end-date')")
	.setRequired(false);
