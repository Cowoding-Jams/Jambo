import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import { logDatePerGameList, logHistoryList, logsPerGameList, playtimePerGameList } from "./list";
import { addEmbedFooter } from "../../util/misc/embeds";

export async function gameActivityTrackerEmbed(
	sort: string,
	order: string,
	offset = 0
): Promise<[EmbedBuilder | null, ActionRowBuilder<ButtonBuilder> | null]> {
	let games;
	let values;
	let pages;

	if (sort == "playtime-per-game") {
		[games, values, pages] = await playtimePerGameList(offset, order);
	} else if (sort == "logs-per-game") {
		[games, values, pages] = await logsPerGameList(offset, order);
	} else if (sort == "log-date-per-game") {
		[games, values, pages] = await logDatePerGameList(offset, order);
	} else {
		[games, values, pages] = await logHistoryList(offset, order);
	}

	if (!Array.isArray(values) || !Array.isArray(games) || typeof pages !== "number") return [null, null];

	if (values.length == 0) {
		const embed = new EmbedBuilder()
			.setTitle("Nothing to list...")
			.setDescription("No activity has been logged yet.");
		return [embed, null];
	}

	const text: { [key: string]: string } = {
		"log-history": "in order they were logged",
		"playtime-per-game": "by the playtime per game",
		"logs-per-game": "by the number of logs per game",
		"log-date-per-game": "last log date per game",
	};

	let embed = new EmbedBuilder()
		.setTitle("Listing/Ranking")
		.setDescription(`Logs sorted ${text[sort]}.\nList order is ${order}.`)
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

	embed = addEmbedFooter(embed);

	const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder()
			.setCustomId(`activity-tracker.jump-left.${offset}.${pages}.${sort}.${order}`)
			.setLabel("◀◀")
			.setStyle(ButtonStyle.Primary)
			.setDisabled(pages == 1),
		new ButtonBuilder()
			.setCustomId(`activity-tracker.left.${offset}.${pages}.${sort}.${order}`)
			.setLabel("◀")
			.setStyle(ButtonStyle.Primary)
			.setDisabled(pages == 1),
		new ButtonBuilder()
			.setCustomId(`activity-tracker.right.${offset}.${pages}.${sort}.${order}`)
			.setLabel("▶")
			.setStyle(ButtonStyle.Primary)
			.setDisabled(pages == 1),
		new ButtonBuilder()
			.setCustomId(`activity-tracker.jump-right.${offset}.${pages}.${sort}.${order}`)
			.setLabel("▶▶")
			.setStyle(ButtonStyle.Primary)
			.setDisabled(pages == 1),
		new ButtonBuilder()
			.setCustomId(`activity-tracker.reload.${offset}.${pages}.${sort}.${order}`)
			.setLabel("↺")
			.setStyle(ButtonStyle.Success)
	);

	return [embed, row];
}
