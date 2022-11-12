import { activityTrackerLogDb } from "../../db";
import { ChatInputCommandInteraction } from "discord.js";
import { splitId } from "./help";
import { gameActivityTrackerEmbed } from "./trackerEmbed";
import { msToReadable } from "../misc/time";

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

	if (order == "decreasing") {
		logs = logs.sort((a, b) => b.w - a.w);
	} else if (order == "increasing") {
		logs = logs.sort((a, b) => a.w - b.w);
	}

	const games: string[] = [];
	const timeAndUser: string[] = [];

	logs.forEach((e) => {
		games.push(e.g.replace(/(\b\w)/g, (e) => e.toUpperCase()));
		timeAndUser.push(`<t:${Math.floor(e.w / 1000)}:d> ⁘ ${e.u}`);
	});

	return [
		games.slice(offset, offset + 10), // games
		timeAndUser.slice(offset, offset + 10), // values
		Math.ceil(games.length / 10), // pages
	];
}

export async function createList(sort: string, offset: number, order: string) {
	offset *= 10;

	if (sort == "log-history") return await nofilter(offset, order);

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

		switch (sort) {
			case "playtime-per-game":
				if (!final.has(game)) {
					final.set(game, playtime);
				} else {
					let time = final.get(game);
					if (time) time += playtime;
					else return;
					final.set(game, time);
				}
				return;
			case "logs-per-game":
				if (!final.has(game)) {
					final.set(game, logs);
				} else {
					let time = final.get(game);
					if (time) time += logs;
					else return;
					final.set(game, time);
				}
				return;
			case "log-date-per-game":
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
		[...final.entries()].sort((a, b) => (order == "decreasing" ? b[1] - a[1] : a[1] - b[1]))
	);

	const games: string[] = [];
	const values: string[] = [];
	sorted.forEach(async (v, k) => {
		k = k.replace(/(\b\w)/g, (e) => e.toUpperCase());
		if (k.length > 14) {
			k = k.slice(0, 13);
			k = k + "…";
		}

		games.push(k);
		if (sort == "playtime-per-game") {
			values.push(msToReadable(v, true));
		} else if (sort == "logs-per-game") {
			values.push(`${v}`);
		} else if (sort == "log-date-per-game") {
			values.push(`<t:${Math.floor(v / 1000)}> ⁘ <t:${Math.floor(v / 1000)}:R>`);
		}
	});

	return [
		games.slice(offset, offset + 10), // games
		values.slice(offset, offset + 10), // values
		Math.ceil(values.length / 10), // pages
	];
}

export async function list(interaction: ChatInputCommandInteraction) {
	await interaction.deferReply();
	const sort = interaction.options.getString("sort") || "log-history";
	const order = interaction.options.getString("order") || "decreasing";

	const [embed, row] = await gameActivityTrackerEmbed(sort, order);
	if (!embed) return;

	await interaction.editReply({ embeds: [embed], components: row ? [row] : [] });
}
