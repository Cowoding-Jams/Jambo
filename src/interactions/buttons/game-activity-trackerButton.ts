import { Button } from "../interactionClasses";
import { ButtonInteraction } from "discord.js";
import { gameActivityTrackerEmbed } from "../../util/tracker/trackerEmbed";

class gameActivityTrackerButton extends Button {
	constructor() {
		super("game-activity-tracker");
	}
	async execute(interaction: ButtonInteraction, args: string[]): Promise<void> {
		let offset = parseInt(args[1]);
		const pages = parseInt(args[2]);

		if (args[0] == "left") offset -= 1;
		else if (args[0] == "left2") offset -= 10;
		else if (args[0] == "right") offset += 1;
		else if (args[0] == "right2") offset += 10;

		if (offset < 0) offset = pages + (offset % pages);
		else offset = offset % pages;

		const filter = args[3];
		const order = args[4];

		const [embed, row] = await gameActivityTrackerEmbed(filter, order, offset);
		if (!embed) return;

		await interaction.update({ embeds: [embed], components: row ? [row] : [] });
	}
}

export default new gameActivityTrackerButton();
