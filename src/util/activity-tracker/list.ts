import { activityTrackerLogDb } from "../../db";
import { ChatInputCommandInteraction } from "discord.js";
import { splitId } from "./help";
import { gameActivityTrackerEmbed } from "./trackerEmbed";
import { discordRelativeTimestamp, discordTimestamp, durationToReadable } from "../misc/time";
import { DateTime, Duration } from "luxon";

interface log {
	user: string;
	game: string;
	date: DateTime;
}

export async function logHistoryList(offset: number, order: string) {
	const keys = activityTrackerLogDb.keyArray();
	const logs: log[] = [];

	keys.forEach((e) => {
		const log = activityTrackerLogDb.get(e);
		if (!log) return;

		const key = splitId(e);
		const user = key.user;
		let game = key.game;

		if (game.length > 14) {
			game = game.slice(0, 13);
			game = game + "…";
		}

		log.forEach((l) => {
			logs.push({ user: `<@!${user}>`, game: game, date: l.date });
		});
	});

	logs.sort((a, b) => (a.date > b.date ? -1 : 1)); // decreasing
	if (order == "increasing") logs.reverse();

	const games: string[] = [];
	const timeAndUser: string[] = [];

	logs.forEach((e) => {
		games.push(e.game.replace(/(\b\w)/g, (e) => e.toUpperCase()));
		timeAndUser.push(`${discordTimestamp(e.date)} ⁘ ${e.user}`);
	});

	return [
		games.slice(offset, offset + 10), // games
		timeAndUser.slice(offset, offset + 10), // values
		Math.ceil(games.length / 10), // pages
	];
}

export async function playtimePerGameList(offset: number, order: string) {
	offset *= 10;

	const keys = activityTrackerLogDb.keyArray();

	const playtimePerGame = new Map<string, Duration>();

	keys.forEach((e) => {
		const log = activityTrackerLogDb.get(e);
		if (!log) return;

		const game = e.split("-")[1];

		const logs = log.length;
		const playtime = Duration.fromObject({ seconds: 0 });

		if (logs == 0) return;

		log.forEach((entry) => {
			playtime.plus(entry.duration);
		});

		if (!playtimePerGame.has(game)) {
			playtimePerGame.set(game, playtime);
		} else {
			const time = playtimePerGame.get(game);
			if (time) time.plus(playtime);
			else return;
			playtimePerGame.set(game, time);
		}
	});

	const entries = Array.from(playtimePerGame.entries());

	entries.sort((a, b) => (a[1] > b[1] ? -1 : 1)); // decreasing
	if (order == "increasing") entries.reverse();

	const sorted = new Map(entries);

	const games: string[] = [];
	const values: string[] = [];
	sorted.forEach(async (v, k) => {
		k = k.replace(/(\b\w)/g, (e) => e.toUpperCase());
		if (k.length > 14) {
			k = k.slice(0, 13);
			k = k + "…";
		}

		games.push(k);
		values.push(durationToReadable(v, true));
	});

	return [
		games.slice(offset, offset + 10), // games
		values.slice(offset, offset + 10), // values
		Math.ceil(values.length / 10), // pages
	];
}

export async function logDatePerGameList(offset: number, order: string) {
	offset *= 10;

	const keys = activityTrackerLogDb.keyArray();

	const logDatePerGame = new Map<string, DateTime>();

	keys.forEach((e) => {
		const log = activityTrackerLogDb.get(e);
		if (!log) return;

		const game = e.split("-")[1];

		const logs = log.length;
		let lastplayed = DateTime.now().minus({ years: 1000 });

		if (logs == 0) return;

		log.forEach((entry) => {
			if (entry.date > lastplayed) lastplayed = entry.date;
		});

		if (!logDatePerGame.has(game)) {
			logDatePerGame.set(game, lastplayed);
		} else {
			const time = logDatePerGame.get(game);
			if (!time) return;
			if (lastplayed > time) {
				logDatePerGame.set(game, lastplayed);
			}
		}
	});

	const entries = Array.from(logDatePerGame.entries());

	entries.sort((a, b) => (a[1] > b[1] ? -1 : 1)); // decreasing
	if (order == "increasing") entries.reverse();

	const sorted = new Map(entries);

	const games: string[] = [];
	const values: string[] = [];
	sorted.forEach(async (v, k) => {
		k = k.replace(/(\b\w)/g, (e) => e.toUpperCase());
		if (k.length > 14) {
			k = k.slice(0, 13);
			k = k + "…";
		}

		games.push(k);
		values.push(`${discordTimestamp(v)} ⁘ ${discordRelativeTimestamp(v)}`);
	});

	return [
		games.slice(offset, offset + 10), // games
		values.slice(offset, offset + 10), // values
		Math.ceil(values.length / 10), // pages
	];
}

export async function logsPerGameList(offset: number, order: string) {
	offset *= 10;

	const keys = activityTrackerLogDb.keyArray();

	const logsPerGame = new Map<string, number>();

	keys.forEach((e) => {
		const log = activityTrackerLogDb.get(e);
		if (!log) return;

		const game = e.split("-")[1];

		const logs = log.length;
		if (logs == 0) return;

		if (!logsPerGame.has(game)) {
			logsPerGame.set(game, logs);
		} else {
			let time = logsPerGame.get(game);
			if (time) time += logs;
			else return;
			logsPerGame.set(game, time);
		}
		return;
	});

	const entries = Array.from(logsPerGame.entries());

	entries.sort((a, b) => b[1] - a[1]); // decreasing
	if (order == "increasing") entries.reverse();

	const sorted = new Map(entries);

	const games: string[] = [];
	const values: string[] = [];
	sorted.forEach(async (v, k) => {
		k = k.replace(/(\b\w)/g, (e) => e.toUpperCase());
		if (k.length > 14) {
			k = k.slice(0, 13);
			k = k + "…";
		}

		games.push(k);
		values.push(`${v}`);
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

	await interaction.editReply({
		embeds: [embed],
		components: row ? [row] : [],
	});
}
