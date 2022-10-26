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
import { splitId } from "./help";

interface log {
	u: string;
	g: string;
	w: number;
}

export async function nofilter(offset: number, order: string) {
	const keys = activityTrackerLogDb.keyArray();
	let logs: log[] = [];

	keys.forEach((e) => {
		const log = activityTrackerLogDb.get(e);
		if (!log) return;

		const out = splitId(e);
		const user = out[0];
		let game = out[1];

		if (game.length > 14) {
			game = game.slice(0, 13);
			game = game + "…";
		}

		log.forEach((l) => {
			logs.push({ u: `<@!${user}>`, g: game, w: l.w });
		});
	});

	if (order == "0") {
		logs = logs.sort((a, b) => b.w - a.w);
	} else if (order == "1") {
		logs = logs.sort((a, b) => a.w - b.w);
	}

	const users: string[] = [];
	const games: string[] = [];
	const time: string[] = [];

	let i = 0;
	logs.forEach((e) => {
		i++;
		games.push(`\`${i}\` ${e.g.replace(/(\b\w)/g, (e) => e.toUpperCase())}`);
		users.push(`${e.u}`);
		time.push(`<t:${Math.floor(e.w / 1000)}:d>`);
	});

	return [
		offset != 0, // left
		games.length - offset > 10, // right
		offset > 90, // left2
		games.length - offset > 100, // right 2
		games.slice(offset, offset + 10), // games
		users.slice(offset, offset + 10), // values
		Math.floor(games.length / 10) + 1, // pages
		time.slice(offset, offset + 10),
	];
}

export async function createList(filter: string, offset: number, order: string) {
	offset *= 10;

	if (filter == "-1") return await nofilter(offset, order);

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
				if (!final.has(game)) {
					final.set(game, playtime);
				} else {
					let time = final.get(game);
					if (time) time += playtime;
					else return;
					final.set(game, time);
				}
				return;
			case "1":
				if (!final.has(game)) {
					final.set(game, logs);
				} else {
					let time = final.get(game);
					if (time) time += logs;
					else return;
					final.set(game, time);
				}
				return;
			case "2":
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
		}
	});

	const sorted = new Map(
		[...final.entries()].sort((a, b) => (order == (filter !== "2" ? "0" : "1") ? b[1] - a[1] : a[1] - b[1]))
	);

	const games: string[] = [];
	const values: string[] = [];
	let of = 0;
	sorted.forEach(async (v, k) => {
		of += 1;
		k = k.replace(/(\b\w)/g, (e) => e.toUpperCase());
		if (k.length > 14) {
			k = k.slice(0, 13);
			k = k + "…";
		}

		games.push(`\`${of}\` ${k}`);
		if (filter == "0") {
			values.push(msToTimeString(v, true));
		} else if (filter == "1") {
			values.push(`${v}`);
		} else if (filter == "2") {
			values.push(`<t:${Math.floor(v / 1000)}> ⁘ <t:${Math.floor(v / 1000)}:R>`);
		}
	});

	return [
		offset != 0, // left
		values.length - offset > 10, // right
		offset > 90, // left2
		values.length - offset > 100, // right 2
		games.slice(offset, offset + 10), // games
		values.slice(offset, offset + 10), // values
		Math.floor(values.length / 10) + 1, // pages
		null,
	];
}

export async function list(interaction: ChatInputCommandInteraction) {
	await interaction.deferReply();
	let filter = interaction.options.getString("sort");
	let order = interaction.options.getString("order");

	if (filter == null) {
		filter = "-1";
	}
	if (order == null) {
		order = "0";
	}

	const [left, right, left2, right2, games, values, pages, extra] = await createList(filter, 0, order);

	if (!Array.isArray(values)) return;
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
		await interaction.editReply({ embeds: [embed] });
		return;
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
			{ name: "Game", value: games.join("\n"), inline: true },
			{ name: "Value", value: values.join("\n"), inline: true }
		)
		.setFooter({ text: `page 1/${pages}` });

	if (Array.isArray(extra)) {
		embed.addFields({ name: "Date", value: extra.join("\n"), inline: true });
	}

	embed = addDefaultEmbedFooter(embed);

	const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder()
			.setCustomId(`game-activity-tracker.left2.0.` + filter + "." + order)
			.setLabel("◀◀")
			.setStyle(left2 ? ButtonStyle.Primary : ButtonStyle.Danger)
			.setDisabled(!left2),
		new ButtonBuilder()
			.setCustomId(`game-activity-tracker.left.0.` + filter + "." + order)
			.setLabel("◀")
			.setStyle(left ? ButtonStyle.Primary : ButtonStyle.Danger)
			.setDisabled(!left),
		new ButtonBuilder()
			.setCustomId(`game-activity-tracker.right.0.` + filter + "." + order)
			.setLabel("▶")
			.setStyle(right ? ButtonStyle.Primary : ButtonStyle.Danger)
			.setDisabled(!right),
		new ButtonBuilder()
			.setCustomId(`game-activity-tracker.right2.0.` + filter + "." + order)
			.setLabel("▶▶")
			.setStyle(right2 ? ButtonStyle.Primary : ButtonStyle.Danger)
			.setDisabled(!right2),
		new ButtonBuilder()
			.setCustomId(`game-activity-tracker.reload.0.` + filter + "." + order)
			.setLabel("↺")
			.setStyle(ButtonStyle.Success)
	);

	await interaction.editReply({ embeds: [embed], components: [row] });
}
