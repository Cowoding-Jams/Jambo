import { Button } from "../interactionClasses";
import { ButtonInteraction } from "discord.js";
import { gameActivityTrackerEmbed } from "../../util/trackerCommand/trackerEmbed";

class gameActivityTrackerButton extends Button {
	constructor() {
		super("game-activity-tracker");
	}
	async execute(interaction: ButtonInteraction, args: string[]): Promise<void> {
		let offset = parseInt(args[1]);
		const pages = parseInt(args[2]);

		const jump = Math.round(pages / 4); // jump by a quarter of the pages

		if (args[0] == "left") offset -= 1;
		else if (args[0] == "jump-left") offset -= jump;
		else if (args[0] == "right") offset += 1;
		else if (args[0] == "jump-right") offset += jump;

		if (offset < 0) offset = pages == 1 ? 0 : pages + (offset % pages);
		else offset = offset % pages;

		const sort = args[3];
		const order = args[4];

		const [embed, row] = await gameActivityTrackerEmbed(sort, order, offset);
		if (!embed) return;

		await interaction.update({ embeds: [embed], components: row ? [row] : [] });
	}
}

export default new gameActivityTrackerButton();
