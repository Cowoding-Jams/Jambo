import { SelectMenu } from "../interactionClasses";
import { GuildMember, SelectMenuInteraction } from "discord.js";
import { logger } from "../../logger";
import { pollDb, proposalDb } from "../../db";
import { pollEmbed, pollSelectMenus, sortBySelectionType } from "../../util/coding-jams/managePolls";
import { getFromEnmap } from "../../util/misc/enmap";

class PollSelectMenu extends SelectMenu {
	constructor() {
		super("poll");
	}

	async execute(interaction: SelectMenuInteraction, customID: string[]): Promise<void> {
		const type = customID[0]; // include/exclude/vote
		const pollKey = customID[1];

		const poll = pollDb.get(pollKey);
		if (!poll) {
			await interaction.reply({ content: "Couldn't find the poll...", ephemeral: true });
			logger.warn("Couldn't find a poll. Probably is an old prompt still open.");
			return;
		}

		const values = interaction.values;

		if (type === "include" || type === "exclude") {
			if (type === "include") {
				poll.include = values;
			} else if (type === "exclude") {
				poll.exclude = values;
			}

			const sorted = sortBySelectionType(poll.selectionType);
			poll.proposals = poll.include;

			const numExtra = poll.numProposals - poll.proposals.length;
			poll.proposals.push(
				...sorted
					.filter((e) => !poll.exclude.includes(e.value))
					.map((e) => e.value)
					.slice(0, numExtra)
			);

			pollDb.set(pollKey, poll);

			await interaction.update({
				embeds: [pollEmbed(poll, "(include/exclude)")],
				components: pollSelectMenus(
					poll,
					pollKey,
					sorted.filter((e) => !poll.exclude.includes(e.value)),
					sorted.filter((e) => !poll.include.includes(e.value))
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
					.map((e) => e.title)
					.join(", ")}`,
			});
		}
	}
}

export default new PollSelectMenu();
