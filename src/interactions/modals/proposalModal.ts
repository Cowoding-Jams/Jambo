import { Modal } from "../interactionClasses";
import { ModalSubmitInteraction } from "discord.js";
import { proposalDb } from "../../db";
import { viewProposalEmbed } from "../../util/proposalCommand/listProposals";
import { DateTime, Duration } from "luxon";

class ProposalModal extends Modal {
	constructor() {
		super("proposal");
	}

	async execute(interaction: ModalSubmitInteraction, customId: string[]): Promise<void> {
		const title = interaction.fields.getTextInputValue("title");
		const description = interaction.fields.getTextInputValue("description");
		const durationString = interaction.fields.getTextInputValue("duration").toUpperCase();
		const duration = Duration.fromISO(durationString);
		const references = interaction.fields.getTextInputValue("references");

		if (!duration.isValid) {
			await interaction.reply({
				content: `Invalid duration format... Please use ISO 8601 (e.g. P2D2H).\n<https://en.wikipedia.org/wiki/ISO_8601>\n\n**Your inputs:**\n- Title: ${title}\n- Description: ${description}\n- Duration: ${durationString}\n- References: ${references}`,
				ephemeral: true,
			});
			return;
		}

		let proposal;

		if (customId[0] == "add") {
			if (proposalDb.find((p) => p.title == title)) {
				await interaction.reply({
					content: "A proposal with that title already exists... Try another one.",
					ephemeral: true,
				});
				return;
			}

			proposal = {
				title: title.trim(),
				description: description.trim(),
				references: references.trim(),
				duration: duration.toISO(),
				ownerID: interaction.user.id,
				votesLastPoll: 0,
				totalVotes: 0,
				polls: 0,
				created: DateTime.now().toISO(),
			};

			// @ts-expect-error - enmap gets fixed
			proposalDb.set(proposalDb.autonum, proposal);
		} else {
			// (customId[0] == "edit")
			const key = customId[1];
			const oldProposal = proposalDb.get(key)!;

			proposal = {
				title: title.trim(),
				description: description.trim(),
				references: references.trim(),
				duration: duration.toISO(),
				ownerID: oldProposal.ownerID,
				votesLastPoll: oldProposal.votesLastPoll,
				totalVotes: oldProposal.totalVotes,
				polls: oldProposal.polls,
				created: oldProposal.created,
			};

			proposalDb.update(key, proposal);
		}

		const embedTitle = customId[0] == "add" ? "(new)" : "(edit)";

		const message = await interaction.reply({
			embeds: [await viewProposalEmbed(interaction, proposal, embedTitle)],
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
