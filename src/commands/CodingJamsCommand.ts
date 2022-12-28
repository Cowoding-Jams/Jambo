import { Command } from "../interactions/interactionClasses";
import {
	ChatInputCommandInteraction,
	Client,
	SlashCommandBuilder,
	SlashCommandIntegerOption,
	SlashCommandStringOption,
	SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";
import { hasAdminPerms } from "../util/misc/permissions";
import { deleteJam, editJam, newJam, viewJam } from "../util/coding-jams/manageJams";
import { deletePoll, editPoll, newPoll, viewPoll, votesPoll } from "../util/coding-jams/managePolls";
import { jamSchedulerTick } from "../util/coding-jams/eventHandler";
import cron from "node-cron";
import { checkDate, checkDuration } from "../util/misc/time";
import { DateTime, Duration } from "luxon";
import { listJams, listPolls } from "../util/coding-jams/listPollsAndJams";

class CodingJamsCommand extends Command {
	constructor() {
		super("coding-jams");
	}

	startScheduler(client: Client) {
		jamSchedulerTick(client);
		// every 30 min
		cron.schedule("*/30 * * * *", jamSchedulerTick.bind(this, client));
	}

	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		if (!(await hasAdminPerms(interaction))) {
			await interaction.reply({
				content: "The coding jam commands are meant to be used by admins only.",
				ephemeral: true,
			});
			return;
		}

		const name = interaction.options.getString("name") || "Default Name";
		const proposal = interaction.options.getString("proposal") || "";

		const numVotes = interaction.options.getInteger("num-votes") || 3;
		const numProposals = interaction.options.getInteger("num-proposals") || 3;
		const selectionType =
			interaction.options.getString("proposal-selection-type") || pollSelectionTypes.topAll;

		const subCmdGroup = interaction.options.getSubcommandGroup() || "cmd";
		const subCmd = interaction.options.getSubcommand();

		let startDate: DateTime | null;
		let endDate: DateTime | null;
		let duration: Duration | null;

		if (subCmd === "new") {
			startDate = await checkDate(interaction, interaction.options.getString("start-date"));
			endDate = await checkDate(interaction, interaction.options.getString("end-date"));
			duration = await checkDuration(interaction, interaction.options.getString("duration"));

			if (!startDate) return;

			if (!(endDate || duration)) {
				await interaction.reply({
					content: "You must provide either an end date or a duration...",
					ephemeral: true,
				});
				return;
			}

			endDate = endDate || startDate.plus(duration!); // can't believe ts can't figure this out by itself... smh
		} else if (subCmd === "extend") {
			endDate = await checkDate(interaction, interaction.options.getString("end-date"));

			if (!endDate) return;
		}

		if (subCmdGroup === "jam") {
			switch (subCmd) {
				case "new":
					newJam(interaction, name, proposal, startDate!);
					break;
				case "extend":
					editJam(interaction, name, endDate!);
					break;
				case "view":
					viewJam(interaction, name);
					break;
				case "delete":
					deleteJam(interaction, name);
					break;
			}
		} else if (subCmdGroup === "poll") {
			switch (subCmd) {
				case "new":
					newPoll(interaction, name, numProposals, numVotes, selectionType, startDate!, endDate!);
					break;
				case "extend":
					editPoll(interaction, name, endDate!);
					break;
				case "view":
					viewPoll(interaction, name);
					break;
				case "delete":
					deletePoll(interaction, name);
					break;
				case "votes":
					votesPoll(interaction, name);
					break;
			}
		} else if (subCmdGroup === "list") {
			if (subCmd === "jams") {
				listJams(interaction);
			} else if (subCmd === "polls") {
				listPolls(interaction);
			}
		}
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
					)
					.addSubcommand((subcommand) =>
						subcommand
							.setName("extend")
							.setDescription("Extend a running poll in its length.")
							.addStringOption(pollNameStringOptionAutocomplete)
							.addStringOption(requiredEndDateStringOption)
					)
					.addSubcommand((subcommand) =>
						subcommand
							.setName("view")
							.setDescription("View an existing poll.")
							.addStringOption(pollNameStringOptionAutocomplete)
					)
					.addSubcommand((subcommand) =>
						subcommand
							.setName("delete")
							.setDescription("Delete an existing poll.")
							.addStringOption(pollNameStringOptionAutocomplete)
					)
					.addSubcommand((subcommand) =>
						subcommand
							.setName("votes")
							.setDescription("View the votes for a poll.")
							.addStringOption(pollNameStringOptionAutocomplete)
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
					)
					.addSubcommand((subcommand) =>
						subcommand
							.setName("extend")
							.setDescription("Extend a running Jam in its length.")
							.addStringOption(jamNameStringOptionAutocomplete)
							.addStringOption(requiredEndDateStringOption)
					)
					.addSubcommand((subcommand) =>
						subcommand
							.setName("view")
							.setDescription("View an existing jam.")
							.addStringOption(jamNameStringOptionAutocomplete)
					)
					.addSubcommand((subcommand) =>
						subcommand
							.setName("delete")
							.setDescription("Delete an existing jam.")
							.addStringOption(jamNameStringOptionAutocomplete)
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

export default new CodingJamsCommand();

// Polls
const pollNameStringOption = new SlashCommandStringOption()
	.setName("name")
	.setDescription("The unique name of the poll. (e.g. 'December 2022 Poll')")
	.setMinLength(4)
	.setMaxLength(30)
	.setRequired(true);

const pollNameStringOptionAutocomplete = new SlashCommandStringOption()
	.setName("name")
	.setDescription("The unique name of the poll.")
	.setMinLength(4)
	.setMaxLength(30)
	.setRequired(true)
	.setAutocomplete(true);

const pollVotesIntegerOption = new SlashCommandIntegerOption()
	.setName("num-votes")
	.setDescription("Number of votes for every person. ('proposals' > 'votes')")
	.setRequired(true)
	.setMinValue(2)
	.setMaxValue(25);

const pollProposalsIntegerOption = new SlashCommandIntegerOption()
	.setName("num-proposals")
	.setDescription("Number of proposals to vote. ('proposals' > 'votes')")
	.setRequired(true)
	.setMinValue(2)
	.setMaxValue(25);

export const pollSelectionTypes = {
	random: "random",
	top: "top",
	bottom: "bottom",
	topAll: "topAll",
	bottomAll: "bottomAll",
	newest: "newest",
	oldest: "oldest",
};

const pollSelectionStringOption = new SlashCommandStringOption()
	.setName("proposal-selection-type")
	.setDescription("Determins which proposals will be selected for voting.")
	.setRequired(true)
	.addChoices(
		{ name: "Top (last time)", value: pollSelectionTypes.top },
		{ name: "Bottom (last time)", value: pollSelectionTypes.bottom },
		{ name: "Random", value: pollSelectionTypes.random },
		{ name: "Newest", value: pollSelectionTypes.newest },
		{ name: "Oldest", value: pollSelectionTypes.oldest },
		{ name: "Top-All (all time)", value: pollSelectionTypes.topAll },
		{ name: "Bottom-All (all time)", value: pollSelectionTypes.bottomAll }
	);

// Jams
const jamNameStringOption = new SlashCommandStringOption()
	.setName("name")
	.setDescription("The name of the jam.")
	.setMinLength(3)
	.setMaxLength(30)
	.setRequired(true);

const jamNameStringOptionAutocomplete = new SlashCommandStringOption()
	.setName("name")
	.setDescription("The name of the jam.")
	.setMinLength(3)
	.setMaxLength(30)
	.setRequired(true)
	.setAutocomplete(true);

const jamProposalNameStringOption = new SlashCommandStringOption()
	.setName("proposal")
	.setDescription("Select the name of the proposal for this jam.")
	.setRequired(true)
	.setAutocomplete(true);

// MISC
const startDateStringOption = new SlashCommandStringOption()
	.setName("start-date")
	.setDescription("Set the start date in the ISO format.")
	.setRequired(true)
	.setAutocomplete(true);

const endDateStringOption = new SlashCommandStringOption()
	.setName("end-date")
	.setDescription("Set the end date in the ISO format. (alternative to 'duration')")
	.setRequired(false)
	.setAutocomplete(true);

const requiredEndDateStringOption = new SlashCommandStringOption()
	.setName("end-date")
	.setDescription("Set the end date in the ISO format. (alternative to 'duration')")
	.setRequired(true)
	.setAutocomplete(true);

const durationStringOption = new SlashCommandStringOption()
	.setName("duration")
	.setDescription("Set the duration in the ISO format. (alternative to 'end-date')")
	.setRequired(false)
	.setAutocomplete(true);
