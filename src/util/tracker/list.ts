import { activityTrackerLogDb } from "../../db";
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ChatInputCommandInteraction,
	EmbedBuilder,
} from "discord.js";
import { addDefaultEmbedFooter } from "../misc/embeds";
import { msToTimeString } from "./presence";

export async function createList(filter: string, offset: number) {
	offset *= 10;
	const keys = activityTrackerLogDb.keyArray();
	const final = new Map<string, number>();

	keys.forEach((e) => {
		const log = activityTrackerLogDb.get(e);
		if (!log) return;

		const game = e.split("-")[1];

		const logs = log.length;
		let playtime = 0;
		let lastplayed = 0;
		let firstplayed = Infinity;

		if (logs == 0) return;

		log.forEach((entry) => {
			playtime += entry.t;
			if (entry.w > lastplayed) lastplayed = entry.w;
			if (entry.w < firstplayed) firstplayed = entry.w;
		});

		switch (filter) {
			case "0":
			case "1":
				if (!final.has(game)) {
					final.set(game, playtime);
				} else {
					let time = final.get(game);
					if (time) time += playtime;
					else return;
					final.set(game, time);
				}
				return;
			case "2":
			case "3":
				if (!final.has(game)) {
					final.set(game, logs);
				} else {
					let time = final.get(game);
					if (time) time += logs;
					else return;
					final.set(game, time);
				}
				return;
			case "4":
				if (!final.has(game)) {
					final.set(game, lastplayed);
				} else {
					const time = final.get(game);
					if (!time) return;
					if (lastplayed > time) {
						final.set(game, lastplayed);
					}
				}
				return;
			case "5":
				if (!final.has(game)) {
					final.set(game, firstplayed);
				} else {
					const time = final.get(game);
					if (!time) return;
					if (lastplayed < time) {
						final.set(game, firstplayed);
					}
				}
				return;
		}
	});

	const sorted = new Map(
		[...final.entries()].sort((a, b) =>
			filter == "0" || filter == "2" || filter == "4" ? b[1] - a[1] : a[1] - b[1]
		)
	);

	const games: string[] = [];
	const values: string[] = [];
	const index: string[] = [];
	let of = 0;
	sorted.forEach(async (v, k) => {
		of += 1;
		index.push(`${of}`);

		if (k.length > 14) {
			k = k.slice(0, 11);
			k = k + "...";
		}

		games.push(`${k}`);
		if (filter == "0" || filter == "1") {
			values.push(msToTimeString(v));
		} else if (filter == "2" || filter == "3") {
			values.push(`${v}`);
		} else if (filter == "4" || filter == "5") {
			values.push(`<t:${Math.floor(v / 1000)}> ⁘ <t:${Math.floor(v / 1000)}:R>`);
		}
	});

	return [
		offset != 0, // left
		values.length - offset > 10, // right
		offset > 90, // left2
		values.length - offset > 100, // right 2
		index.slice(offset, offset + 10), // index
		games.slice(offset, offset + 10), // games
		values.slice(offset, offset + 10), // values
		Math.floor(values.length / 10) + 1,
	];
}

export async function list(interaction: ChatInputCommandInteraction) {
	await interaction.deferReply();
	const filter = interaction.options.getString("filter", true);

	const [left, right, left2, right2, index, games, values, pages] = await createList(filter, 0);

	if (!Array.isArray(values)) return;
	if (!Array.isArray(index)) return;
	if (!Array.isArray(games)) return;
	if (typeof left !== "boolean") return;
	if (typeof right !== "boolean") return;
	if (typeof left2 !== "boolean") return;
	if (typeof right2 !== "boolean") return;
	if (typeof pages !== "number") return;

	if (values.length == 0) {
		const embed = new EmbedBuilder()
			.setTitle("Nothing to list...")
			.setDescription("No activity has been logged yet.");
		await interaction.reply({ embeds: [embed] });
		return;
	}

	let embed = new EmbedBuilder()
		.setTitle("<title work in progress>")
		.setDescription("wip")
		.addFields(
			{ name: "Index", value: index.join("\n"), inline: true },
			{ name: "Game", value: games.join("\n"), inline: true },
			{ name: "Value", value: values.join("\n"), inline: true }
		)
		.setFooter({ text: `page 1/${pages}` });

	embed = addDefaultEmbedFooter(embed);

	const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder()
			.setCustomId(`game-activity-tracker.left2.0.` + filter)
			.setLabel("◀◀")
			.setStyle(left2 ? ButtonStyle.Primary : ButtonStyle.Danger)
			.setDisabled(!left2 ? true : false),
		new ButtonBuilder()
			.setCustomId(`game-activity-tracker.left.0.` + filter)
			.setLabel("◀")
			.setStyle(left ? ButtonStyle.Primary : ButtonStyle.Danger)
			.setDisabled(!left ? true : false),
		new ButtonBuilder()
			.setCustomId(`game-activity-tracker.right.0.` + filter)
			.setLabel("▶")
			.setStyle(right ? ButtonStyle.Primary : ButtonStyle.Danger)
			.setDisabled(!right ? true : false),
		new ButtonBuilder()
			.setCustomId(`game-activity-tracker.right2.0.` + filter)
			.setLabel("▶▶")
			.setStyle(right2 ? ButtonStyle.Primary : ButtonStyle.Danger)
			.setDisabled(!right2 ? true : false)
	);

	await interaction.editReply({ embeds: [embed], components: [row] });
}
