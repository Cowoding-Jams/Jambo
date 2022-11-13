import { Modal } from "../interactionClasses";
import { ModalSubmitInteraction } from "discord.js";
import { proposalDb } from "../../db";
import { viewProposalEmbed } from "../../util/proposalCommand/listProposals";

class ProposalModal extends Modal {
	constructor() {
		super("proposal");
	}

	async execute(interaction: ModalSubmitInteraction, customId: string[]): Promise<void> {
		if (["add", "edit"].includes(customId[0])) {
			const title = interaction.fields.getTextInputValue("title");
			const description = interaction.fields.getTextInputValue("description");
			const timePeriod = interaction.fields.getTextInputValue("time-period");
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

			const embedTitle = customId[0] == "add" ? "(new)" : "(edit)";

			proposal = {
				title: title.trim(),
				description: description.trim(),
				references: references.trim(),
				timePeriod: timePeriod.trim(),
				owner: interaction.user.id,
			};

			proposalDb.set(title, proposal);

			await interaction.reply({ embeds: [await viewProposalEmbed(interaction, proposal, embedTitle)] });
		}
	}
}

export default new ProposalModal();
