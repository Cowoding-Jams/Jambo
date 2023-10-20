import { SelectMenu } from "../interactionClasses";
import { bold, GuildMember, StringSelectMenuInteraction } from "discord.js";
import { logger } from "../../logger";
import { pollDb, proposalDb } from "../../db";
import {
	pollEmbed,
	pollSelectMenus,
	sortBySelectionType,
	unusedProposals,
} from "../../util/coding-jams/managePoll";
import { getFromEnmap } from "../../util/misc/enmap";

class PollSelectMenu extends SelectMenu {
	constructor() {
		super("poll");
	}

	async execute(interaction: StringSelectMenuInteraction, customID: string[]): Promise<void> {
		const type = customID[0]; // include/exclude/vote
		const pollKey = customID[1];

		const poll = pollDb.get(pollKey);
		if (!poll) {
			await interaction.reply({ content: "Couldn't find the poll...", ephemeral: true });
			logger.warn(`Couldn't find a poll using key "${pollKey}"`);
			return;
		}

		let values = interaction.values;

		if (type === "include" || type === "exclude") {
			if (values.includes("-")) values = [];

			const unused = unusedProposals();

			if (type === "include") {
				if (values.length > poll.numProposals) {
					await interaction.reply({
						content: `You can't include ${values.length} proposals because the required amount of proposals is ${poll.numProposals}. So no proposals were used.`,
						ephemeral: true,
					});
					return;
				}
				poll.include = values;
			} else if (type === "exclude") {
				if (unused.size - values.length < poll.numProposals) {
					await interaction.reply({
						content: `You can't exclude ${values.length} proposals because then only ${
							unused.size - values.length
						} proposals are left, which is less than the required amount of ${
							poll.numProposals
						} proposals. No proposals were used.`,
						ephemeral: true,
					});
					return;
				}
				poll.exclude = values;
			}

			const sorted = sortBySelectionType(unused, poll.selectionType);
			poll.proposals = poll.include.slice(0); // copy the array

			const numExtra = poll.numProposals - poll.proposals.length;
			poll.proposals.push(
				...sorted
					.filter((e) => !poll.exclude.includes(e.key) && !poll.include.includes(e.key))
					.map((e) => e.key)
					.slice(0, numExtra)
			);

			pollDb.set(pollKey, poll);

			await interaction.update({
				embeds: [pollEmbed(poll, pollKey, "(include/exclude)")],
				components: pollSelectMenus(
					pollKey,
					sorted.filter((e) => !poll.exclude.includes(e.key)).filter((v) => !poll.proposals.includes(v.key)),
					sorted.filter((e) => !poll.include.includes(e.key)).filter((v) => poll.proposals.includes(v.key))
				),
			});
		} else if (type === "vote") {
			const user = interaction.user.id;
			poll.votes.set(user, values);
			pollDb.set(pollKey, poll);

			const proposals = getFromEnmap(proposalDb, values);

			const member: GuildMember | null | undefined = await interaction.guild?.members
				.fetch(interaction.user.id)
				.catch(() => null);
			await interaction.reply({
				content: `Thanks for voting ${member?.displayName || interaction.user}!\nYou voted for ${proposals
					.map((e) => bold(e.title))
					.join(", ")}`,
				ephemeral: true,
			});
		}
	}
}

export default new PollSelectMenu();
