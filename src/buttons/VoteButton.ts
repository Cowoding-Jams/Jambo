import { ButtonHandler } from "../ButtonHandler";
import { ButtonInteraction, MessageActionRow, MessageSelectMenu } from "discord.js";
import { pollDb } from "db";

class VoteButton extends ButtonHandler {
	constructor() {
		super("vote");
	}

	async execute(interaction: ButtonInteraction, args: string[]): Promise<void> {
		await interaction.deferReply({
			ephemeral: true,
		});

		const [id] = args;

		const poll = pollDb.get(parseInt(id));

		if (!poll) {
			await interaction.editReply("Poll does not exist");
			return;
		}

		const voted = poll.options.filter((o) => o.votes.includes(interaction.user.id));
		const remaining = poll.numberOfVotes - voted.length;

		const menu = new MessageSelectMenu()
			.setCustomId(interaction.customId)
			.setMaxValues(1)
			.setMinValues(1)
			.setOptions(
				poll.options.map((p, i) => ({
					label: `${voted.findIndex((v) => v.id === p.id) === -1 ? "+" : "-"} ${p.name}`,
					value: i.toString(),
				}))
			);

		const row = new MessageActionRow().addComponents(menu);

		await interaction.editReply({
			content: `You have ${remaining} votes remaining. Add or remove a vote for a proposal.`,
			components: [row],
		});
	}
}

export default new VoteButton();
