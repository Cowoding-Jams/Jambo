import { Modal } from "../interactionClasses";
import { EmbedBuilder, ModalSubmitInteraction } from "discord.js";
import { addEmbedColor } from "../../util/misc/embeds";
import { proposalDb } from "../../db";

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
			const proposal = proposalDb.get(title);

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
			const embed = new EmbedBuilder()
				.setTitle(`${title} ⁘ ${embedTitle}`)
				.setDescription(description)
				.addFields(
					{ name: "References", value: references ? references : "-" },
					{ name: "Proposed Time Period", value: timePeriod },
					{
						name: "Proposed By",
						value: proposal
							? (await interaction.guild?.members.fetch(proposal.owner))?.toString() || "Unknown"
							: interaction.user.toString(),
					}
				);

			proposalDb.set(title, {
				title: title,
				description: description,
				references: references,
				timePeriod: timePeriod,
				owner: interaction.user.id,
			});

			await interaction.reply({ embeds: [addEmbedColor(embed)] });
		}
	}
}

export default new ProposalModal();
