import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import { createList } from "./list";
import { addDefaultEmbedFooter } from "../../util/misc/embeds";

export async function gameActivityTrackerEmbed(
	filter: string,
	order: string,
	offset = 0
): Promise<[EmbedBuilder | null, ActionRowBuilder<ButtonBuilder> | null]> {
	const [games, values, pages] = await createList(filter, offset, order);

	if (!Array.isArray(values) || !Array.isArray(games) || typeof pages !== "number") return [null, null];

	if (values.length == 0) {
		const embed = new EmbedBuilder()
			.setTitle("Nothing to list...")
			.setDescription("No activity has been logged yet.");
		return [embed, null];
	}

	let embed = new EmbedBuilder()
		.setTitle("Listing/Ranking")
		.setDescription(
			`Logs sorted ${
				filter == "-1"
					? "in order they were logged"
					: "for `" +
					  (filter == "0" ? "Playtime" : filter == "1" ? "Amount of logs" : filter == "2" ? "Logdate" : "") +
					  "`"
			}.\nList order is \`${order == "1" ? "increasing" : "decreasing"}\`.`
		)
		.addFields(
			{
				name: "#",
				value: [...Array(games.length).keys()]
					.map((i) =>
						(i + 10 * offset).toString().padStart((games.length + 10 * offset).toString().length, "0")
					)
					.join("\n"),
				inline: true,
			},
			{ name: "Game", value: games.join("\n"), inline: true },
			{ name: "Value", value: values.join("\n"), inline: true }
		)
		.setFooter({ text: `Page ${offset + 1}/${pages}` });

	embed = addDefaultEmbedFooter(embed);

	const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder()
			.setCustomId(`game-activity-tracker.left2.${offset}.${pages}.${filter}.${order}`)
			.setLabel("◀◀")
			.setStyle(ButtonStyle.Primary),
		new ButtonBuilder()
			.setCustomId(`game-activity-tracker.left.${offset}.${pages}.${filter}.${order}`)
			.setLabel("◀")
			.setStyle(ButtonStyle.Primary),
		new ButtonBuilder()
			.setCustomId(`game-activity-tracker.right.${offset}.${pages}.${filter}.${order}`)
			.setLabel("▶")
			.setStyle(ButtonStyle.Primary),
		new ButtonBuilder()
			.setCustomId(`game-activity-tracker.right2.${offset}.${pages}.${filter}.${order}`)
			.setLabel("▶▶")
			.setStyle(ButtonStyle.Primary),
		new ButtonBuilder()
			.setCustomId(`game-activity-tracker.reload.${offset}.${pages}.${filter}.${order}`)
			.setLabel("↺")
			.setStyle(ButtonStyle.Success)
	);

	return [embed, row];
}
