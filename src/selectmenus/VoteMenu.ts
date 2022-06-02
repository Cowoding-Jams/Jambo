import { SelectMenuHandler } from "../SelectMenuHandler";
import { SelectMenuInteraction, Util } from "discord.js";
import { pollDb } from "db";

class VoteMenu extends SelectMenuHandler {
	constructor() {
		super("vote");
	}

	async execute(interaction: SelectMenuInteraction, args: string[]): Promise<void> {
		await interaction.deferUpdate();
		const [id] = args;
		const poll = pollDb.get(parseInt(id));

		if (!poll) {
			await interaction.update("Poll does not exist");
			return;
		}
		const optionIndex = parseInt(interaction.values[0]);

		const voted = poll.options.filter((o) => o.votes.includes(interaction.user.id));

		if (voted.findIndex((v) => v.id === poll.options[optionIndex].id) === -1) {
			if (voted.length >= poll.numberOfVotes) {
				await interaction.update("You have reached the maximum number of votes");
				return;
			}
			pollDb.push(poll.id, interaction.user.id, `options.${optionIndex}.votes`);
			await interaction.update(`Voted for \`${Util.escapeInlineCode(poll.options[optionIndex].name)}\``);
		} else {
			// @ts-expect-error enmaps typings are wrong yet again
			pollDb.remove(poll.id, interaction.user.id, `options.${optionIndex}.votes`);
			await interaction.update(`Removed vote for ${poll.options[optionIndex].name}`);
		}
	}
}

export default new VoteMenu();
