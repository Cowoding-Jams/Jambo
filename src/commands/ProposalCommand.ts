import { Command } from "../interactions/interactionClasses";
import {
	ChatInputCommandInteraction,
	SlashCommandBuilder,
	SlashCommandStringOption,
	SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";
import { addProposal, deleteProposal, editProposal } from "../util/proposal/manageProposals";
import { listProposals, viewProposal } from "../util/proposal/listProposals";

class ProposalCommand extends Command {
	constructor() {
		super("proposals");
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
			.setName("proposals")
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
					.setDescription("Edit a proposals title, description or time period.")
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
		.setDescription("The title of the proposal to select.")
		.setRequired(true)
		.setAutocomplete(true);
