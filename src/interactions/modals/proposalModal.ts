import { Modal } from "../interactionClasses";
import { ModalSubmitInteraction } from "discord.js";
import { proposalDb } from "../../db";
import { viewProposalEmbed } from "../../util/proposalCommand/listProposals";
import { Duration } from "luxon";

class ProposalModal extends Modal {
	constructor() {
		super("proposal");
	}

	async execute(interaction: ModalSubmitInteraction, customId: string[]): Promise<void> {
		if (["add", "edit"].includes(customId[0])) {
			const title = interaction.fields.getTextInputValue("title");
			const description = interaction.fields.getTextInputValue("description");
			const duration = Duration.fromISO(interaction.fields.getTextInputValue("duration").toUpperCase());
			const references = interaction.fields.getTextInputValue("references");
			let proposal = proposalDb.get(title);

			if (customId[0] == "add") {
				if (proposal) {
					await interaction.reply({
						content: "A proposal with that title already exists... Try another one.",
						ephemeral: true,
					});
					return;
				}
			}

			proposal = {
				title: title.trim(),
				description: description.trim(),
				references: references.trim(),
				duration: duration.toISO(),
				ownerID: proposal?.ownerID || interaction.user.id,
				votesLastPoll: proposal?.votesLastPoll || 0,
				totalVotes: proposal?.totalVotes || 0,
				polls: proposal?.polls || 0,
			};

			proposalDb.set(title, proposal);

			const embedTitle = customId[0] == "add" ? "(new)" : "(edit)";
			await interaction.reply({ embeds: [await viewProposalEmbed(interaction, proposal, embedTitle)] });
		}
	}
}

export default new ProposalModal();
