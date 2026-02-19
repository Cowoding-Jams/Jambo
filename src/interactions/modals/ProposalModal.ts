import { ModalSubmitInteraction } from "discord.js";
import { DateTime } from "luxon";
import { proposalDb } from "../../db.js";
import { checkDuration } from "../../util/misc/time.js";
import { viewProposalEmbed } from "../../util/proposal/listProposals.js";
import { Modal } from "../interactionClasses.js";

class ProposalModal extends Modal {
	constructor() {
		super("proposal");
	}

	async execute(interaction: ModalSubmitInteraction, customId: string[]): Promise<void> {
		const title = interaction.fields.getTextInputValue("title").trim();
		const abbreviation = interaction.fields
			.getTextInputValue("abbreviation")
			.trim()
			.toLowerCase()
			.replaceAll(" ", "-");
		const description = interaction.fields.getTextInputValue("description").trim();
		const durationString = interaction.fields.getTextInputValue("duration").trim().toUpperCase();
		const references = interaction.fields.getTextInputValue("references").trim();

		const duration = await checkDuration(interaction, durationString);

		if (!duration) return;
		if (duration.as("hours") < 1) {
			await interaction.reply({
				content: "That seems a bit short for a jam... Try another duration.",
				ephemeral: true,
			});
			return;
		}

		let proposal;
		if (customId[0] == "add") {
			if (proposalDb.find((p) => p.title === title)) {
				await interaction.reply({
					content: `A proposal with the name "${title}" already exists... Try another one.`,
					ephemeral: true,
				});
				return;
			}

			proposal = {
				title: title,
				abbreviation: abbreviation,
				description: description,
				references: references,
				duration: duration,
				owner: interaction.user.id,
				votesLastPoll: 0,
				totalVotes: 0,
				polls: 0,
				created: DateTime.now(),
				used: false,
			};

			proposalDb.set(String(proposalDb.autonum), proposal);
		} else {
			// (customId[0] == "edit")
			const key = customId[1];
			const oldProposal = proposalDb.get(key)!;

			proposal = {
				title: title,
				abbreviation: abbreviation,
				description: description,
				references: references,
				duration: duration,
				owner: oldProposal.owner,
				votesLastPoll: oldProposal.votesLastPoll,
				totalVotes: oldProposal.totalVotes,
				polls: oldProposal.polls,
				created: oldProposal.created,
				used: oldProposal.used,
			};

			proposalDb.update(key, proposal);
		}

		const embedTitle = customId[0] == "add" ? "(new)" : "(edit)";

		const message = await interaction.reply({
			embeds: [await viewProposalEmbed(proposal, embedTitle)],
			fetchReply: true,
		});

		(
			await message.startThread({
				name: `💬 ${proposal.title} ${embedTitle}`,
			})
		).send(
			"This thread is here to discuss the new or edited proposal. Ask questions, give feedback, etc. If you agree on some changes edit the proposal in the channel and a new thread will be there to discuss the edit :)"
		);
	}
}

export default new ProposalModal();
