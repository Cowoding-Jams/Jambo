import { Modal } from "../interactionClasses";
import { ModalSubmitInteraction } from "discord.js";
import { proposalDb } from "../../db";
import { viewProposalEmbed } from "../../util/proposal/listProposals";
import { DateTime } from "luxon";
import { checkDuration } from "../../util/misc/time";

class ProposalModal extends Modal {
	constructor() {
		super("proposals");
	}

	async execute(interaction: ModalSubmitInteraction, customId: string[]): Promise<void> {
		const title = interaction.fields.getTextInputValue("title");
		const abbreviation = interaction.fields.getTextInputValue("abbreviation");
		const description = interaction.fields.getTextInputValue("description");
		const durationString = interaction.fields.getTextInputValue("duration").toUpperCase();
		const references = interaction.fields.getTextInputValue("references");

		const duration = await checkDuration(
			interaction,
			durationString,
			`**Your inputs:**\n- Title: ${title}\n- Description: ${description}\n- Duration: ${durationString}\n- References: ${references}`
		);

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
				title: title.trim(),
				abbreviation: abbreviation.trim(),
				description: description.trim(),
				references: references.trim(),
				duration: duration,
				owner: interaction.user.id,
				votesLastPoll: 0,
				totalVotes: 0,
				polls: 0,
				created: DateTime.now(),
			};

			proposalDb.set(proposalDb.autonum, proposal);
		} else {
			// (customId[0] == "edit")
			const key = customId[1];
			const oldProposal = proposalDb.get(key)!;

			proposal = {
				title: title.trim(),
				abbreviation: abbreviation.trim(),
				description: description.trim(),
				references: references.trim(),
				duration: duration,
				owner: oldProposal.owner,
				votesLastPoll: oldProposal.votesLastPoll,
				totalVotes: oldProposal.totalVotes,
				polls: oldProposal.polls,
				created: oldProposal.created,
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
