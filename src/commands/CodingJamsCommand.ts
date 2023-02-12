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
import { deletePoll, editPoll, newPoll, viewPoll, votesPoll } from "../util/coding-jams/managePoll";
import { jamSchedulerTick } from "../util/coding-jams/eventHandler";
import cron from "node-cron";
import { checkDate, checkDuration } from "../util/misc/time";
import { DateTime, Duration } from "luxon";
import { listJams, listPolls } from "../util/coding-jams/listPollsAndJams";
import { jamDb, pollDb } from "../db";

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

		const now = DateTime.now();

		if (subCmd === "new") {
			startDate = await checkDate(interaction, interaction.options.getString("start-date"));
			endDate = await checkDate(interaction, interaction.options.getString("end-date"));
			duration = await checkDuration(interaction, interaction.options.getString("duration"));

			if (!startDate) return;
			if (startDate < now) {
				await interaction.reply({ content: "The start date must be in the future!", ephemeral: true });
				return;
			}

			if (!(endDate || duration) && subCmdGroup === "poll") {
				await interaction.reply({
					content: "You must provide either an end date or a duration...",
					ephemeral: true,
				});
				return;
			}

			if (subCmdGroup === "poll") {
				endDate = endDate || startDate.plus(duration!);
				if (endDate < now) {
					await interaction.reply({ content: "The end date must be in the future!", ephemeral: true });
					return;
				}
			}
		} else if (subCmd === "extend") {
			endDate = await checkDate(interaction, interaction.options.getString("end-date"));

			if (!endDate) return;
			if (endDate < now) {
				await interaction.reply({ content: "The end date must be in the future!", ephemeral: true });
				return;
			}
		}

		if (subCmdGroup === "jam") {
			if (subCmd === "new") {
				newJam(interaction, name, proposal, startDate!);
			} else {
				const jamKey = jamDb.findKey((j) => j.title === name);
				if (!jamKey) {
					interaction.reply({ content: `There is no jam with the name "${name}".`, ephemeral: true });
					return;
				}
				const jam = jamDb.get(jamKey)!;

				switch (subCmd) {
					case "extend":
						editJam(interaction, jam, jamKey, endDate!);
						break;
					case "view":
						viewJam(interaction, jam, jamKey);
						break;
					case "delete":
						deleteJam(interaction, jam, jamKey);
						break;
				}
			}
		} else if (subCmdGroup === "poll") {
			if (subCmd === "new") {
				newPoll(interaction, name, numProposals, numVotes, selectionType, startDate!, endDate!);
			} else {
				const pollKey = pollDb.findKey((poll) => poll.title === name);
				if (!pollKey) {
					interaction.reply({ content: `There is no jam with the name "${name}".`, ephemeral: true });
					return;
				}
				const poll = pollDb.get(pollKey)!;

				switch (subCmd) {
					case "extend":
						editPoll(interaction, poll, pollKey, endDate!);
						break;
					case "view":
						viewPoll(interaction, poll, pollKey);
						break;
					case "delete":
						deletePoll(interaction, poll, pollKey);
						break;
					case "votes":
						votesPoll(interaction, poll);
						break;
				}
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
							.setDescription("Extend a running or future poll in its length.")
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
							.setDescription("Extend a running or future Jam in its length.")
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
	.setDescription("Number of proposals every person can vote for. ('proposals' > 'votes')")
	.setRequired(true)
	.setMinValue(2)
	.setMaxValue(25);

const pollProposalsIntegerOption = new SlashCommandIntegerOption()
	.setName("num-proposals")
	.setDescription("Number of proposals in the poll. ('proposals' > 'votes')")
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
	fewestPolls: "fewestPolls",
	mostPolls: "mostPolls",
};

const pollSelectionStringOption = new SlashCommandStringOption()
	.setName("proposal-selection-type")
	.setDescription("Determines which proposals will be selected for voting.")
	.setRequired(true)
	.addChoices(
		{ name: "Top (last time)", value: pollSelectionTypes.top },
		{ name: "Bottom (last time)", value: pollSelectionTypes.bottom },
		{ name: "Random", value: pollSelectionTypes.random },
		{ name: "Newest", value: pollSelectionTypes.newest },
		{ name: "Oldest", value: pollSelectionTypes.oldest },
		{ name: "Fewest polls", value: pollSelectionTypes.fewestPolls },
		{ name: "Most polls", value: pollSelectionTypes.mostPolls },
		{ name: "Top-All (all time)", value: pollSelectionTypes.topAll },
		{ name: "Bottom-All (all time)", value: pollSelectionTypes.bottomAll }
	);

// Jams
const jamNameStringOption = new SlashCommandStringOption()
	.setName("name")
	.setDescription("The unique name of the jam. (e.g. 'December 2022 Jam')")
	.setMinLength(3)
	.setMaxLength(30)
	.setRequired(true);

const jamNameStringOptionAutocomplete = new SlashCommandStringOption()
	.setName("name")
	.setDescription("The unique name of the jam.")
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
