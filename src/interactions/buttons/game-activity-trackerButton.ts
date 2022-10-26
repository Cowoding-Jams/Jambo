import { Button } from "../interactionClasses";
import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, EmbedBuilder } from "discord.js";
import { createList } from "../../util/tracker/list";
import { addDefaultEmbedFooter } from "../../util/misc/embeds";

class gameActivityTrackerButton extends Button {
	constructor() {
		super("game-activity-tracker");
	}
	async execute(interaction: ButtonInteraction, args: string[]): Promise<void> {
		let offset = parseInt(args[1]);
		if (args[0] == "left") offset -= 1;
		else if (args[0] == "left2") offset -= 10;
		else if (args[0] == "right") offset += 1;
		else if (args[0] == "right2") offset += 10;

		const filter = args[2];
		const order = args[3];
		const [left, right, left2, right2, games, values, pages, extra] = await createList(filter, offset, order);

		if (!Array.isArray(values)) return;
		if (!Array.isArray(games)) return;
		if (typeof left !== "boolean") return;
		if (typeof right !== "boolean") return;
		if (typeof left2 !== "boolean") return;
		if (typeof right2 !== "boolean") return;
		if (typeof pages !== "number") return;

		let embed = new EmbedBuilder()
			.setTitle("Listing/Ranking")
			.setDescription(
				`Logs sorted ${
					filter == "-1"
						? "in order they were logged"
						: "for `" +
						  (filter == "0"
								? "Playtime"
								: filter == "1"
								? "Amount of logs"
								: filter == "2"
								? "Logdate"
								: "") +
						  "`"
				}.\nList order is \`${order == "1" ? "increasing" : "decreasing"}\`.`
			)
			.addFields(
				{ name: "Game", value: games.join("\n"), inline: true },
				{ name: "Value", value: values.join("\n"), inline: true }
			)
			.setFooter({ text: `page ${offset + 1}/${pages}` });

		if (Array.isArray(extra)) {
			embed.addFields({ name: "Date", value: extra.join("\n"), inline: true });
		}

		embed = addDefaultEmbedFooter(embed);

		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder()
				.setCustomId(`game-activity-tracker.left2.${offset}.` + filter + "." + order)
				.setLabel("◀◀")
				.setStyle(left2 ? ButtonStyle.Primary : ButtonStyle.Danger)
				.setDisabled(!left2),
			new ButtonBuilder()
				.setCustomId(`game-activity-tracker.left.${offset}.` + filter + "." + order)
				.setLabel("◀")
				.setStyle(left ? ButtonStyle.Primary : ButtonStyle.Danger)
				.setDisabled(!left),
			new ButtonBuilder()
				.setCustomId(`game-activity-tracker.right.${offset}.` + filter + "." + order)
				.setLabel("▶")
				.setStyle(right ? ButtonStyle.Primary : ButtonStyle.Danger)
				.setDisabled(!right),
			new ButtonBuilder()
				.setCustomId(`game-activity-tracker.right2.${offset}.` + filter + "." + order)
				.setLabel("▶▶")
				.setStyle(right2 ? ButtonStyle.Primary : ButtonStyle.Danger)
				.setDisabled(!right2),
			new ButtonBuilder()
				.setCustomId(`game-activity-tracker.reload.${offset}.` + filter + "." + order)
				.setLabel("↺")
				.setStyle(ButtonStyle.Success)
		);

		await interaction.update({ embeds: [embed], components: [row] });
	}
}

export default new gameActivityTrackerButton();
