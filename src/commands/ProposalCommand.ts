import {
	ChatInputCommandInteraction,
	SlashCommandBuilder,
	SlashCommandStringOption,
	SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";
import { Command } from "../interactions/interactionClasses.js";
import { listProposals, viewProposal } from "../util/proposal/listProposals.js";
import { addProposal, deleteProposal, editProposal } from "../util/proposal/manageProposals.js";

class ProposalCommand extends Command {
	constructor() {
		super("proposal");
	}

	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		if (interaction.channel?.isThread()) {
			await interaction.reply({
				content:
					"These commands are not allowed in threads. Please use them in the main channel for everyone to see them.",
				ephemeral: true,
			});
			return;
		}

		const subcommand = interaction.options.getSubcommand();

		const commands: { [key: string]: (interaction: ChatInputCommandInteraction) => Promise<void> } = {
			add: addProposal,
			delete: deleteProposal,
			edit: editProposal,
			view: viewProposal,
			list: listProposals,
		};

		await commands[subcommand](interaction);
	}

	register(): SlashCommandSubcommandsOnlyBuilder {
		return new SlashCommandBuilder()
			.setName("proposal")
			.setDescription("To manage all the proposals for upcoming jams.")
			.addSubcommand((subcommand) => subcommand.setName("add").setDescription("Create a proposal."))
			.addSubcommand((subcommand) =>
				subcommand
					.setName("delete")
					.setDescription("Delete a proposal.")
					.addStringOption(proposalSelectStringOption)
			)
			.addSubcommand((subcommand) =>
				subcommand
					.setName("edit")
					.setDescription("Edit an existing proposal.")
					.addStringOption(proposalSelectStringOption)
			)
			.addSubcommand((subcommand) =>
				subcommand
					.setName("view")
					.setDescription("View one of the proposals.")
					.addStringOption(proposalSelectStringOption)
			)
			.addSubcommand((subcommand) => subcommand.setName("list").setDescription("Lists all the proposals."));
	}
}

export default new ProposalCommand();

const proposalSelectStringOption = (option: SlashCommandStringOption) =>
	option
		.setName("title")
		.setDescription("The title of the proposal.")
		.setRequired(true)
		.setAutocomplete(true);
