import { AutocompleteInteraction } from "discord.js";
import { activityTrackerBlacklistDb, activityTrackerLogDb } from "../../db";
import { splitId } from "./help";
import { hasAdminRole } from "../misc/permissions";

export async function adminWhitelist(interaction: AutocompleteInteraction) {
	if (await hasAdminRole(interaction)) {
		await interaction.respond([
			{
				name: "You don't have the permissions to use this command!",
				value: "missing-permissions",
			},
		]);
		return;
	}

	let options: string[] | undefined = activityTrackerBlacklistDb.get("general-game");

	options = [...new Set(options)];

	if (options?.length === 0 || !options) {
		await interaction.respond([
			{
				name: "The global blacklist is empty...",
				value: "empty-global-blacklist",
			},
		]);
		return;
	}

	let map = filterAndMapAutocompletion(interaction, options);
	map = map.slice(0, 25);

	await interaction.respond(map);
}

export async function statisticsMystats(interaction: AutocompleteInteraction) {
	const allKeys = activityTrackerLogDb.keyArray();
	let games: string[] = [];
	allKeys.forEach((e) => {
		const [userEntry, gameEntry] = splitId(e);
		if (userEntry !== interaction.user.id) return;
		games.push(gameEntry);
	});

	games = [...new Set(games)];

	if (games.length == 0) {
		await interaction.respond(noLogsYet);
		return;
	}

	let map = filterAndMapAutocompletion(interaction, games);
	map = map.slice(0, 25);

	await interaction.respond(map);
}

export async function statisticsGamestats(interaction: AutocompleteInteraction) {
	const allKeys = activityTrackerLogDb.keyArray();
	let games: string[] = [];
	allKeys.forEach((e) => {
		const gameEntry = splitId(e)[1];
		games.push(gameEntry);
	});

	games = [...new Set(games)];

	if (games.length == 0) {
		await interaction.respond(noLogsYet);
		return;
	}

	let map = filterAndMapAutocompletion(interaction, games);
	map = map.slice(0, 25);

	await interaction.respond(map);
}

export async function blacklistRemove(interaction: AutocompleteInteraction) {
	let options: string[] | undefined = activityTrackerBlacklistDb.get(interaction.user.id);

	options = [...new Set(options)];

	if (activityTrackerBlacklistDb.get("general-user")?.includes(interaction.user.id)) {
		await interaction.respond([
			{
				name: "<Tracking is disabled, select this to activate it again>",
				value: "Tracking is disabled, select this to activate it again",
			},
		]);
		return;
	}

	if (options?.length === 0 || !options) {
		await interaction.respond([
			{ name: "No games are on your blacklist", value: "No games are on your blacklist" },
		]);
		return;
	}

	let map = filterAndMapAutocompletion(interaction, options);
	map = map.slice(0, 25);

	await interaction.respond(map);
}

export async function blacklistAdd(interaction: AutocompleteInteraction) {
	const allKeys = activityTrackerLogDb.keyArray();
	let games: string[] = [];
	allKeys.forEach((e) => {
		const [userEntry, gameEntry] = splitId(e);
		if (userEntry !== interaction.user.id) return;
		games.push(gameEntry);
	});

	games = [...new Set(games)];

	if (games.length == 0) {
		await interaction.respond(noLogsYet);
		return;
	}

	let map = filterAndMapAutocompletion(interaction, games);
	map = map.slice(0, 24);

	map.push({ name: "<Disable tracking for all games>", value: "Disable Tracking" });

	await interaction.respond(map);
}

const noLogsYet = [{ name: "Nothing has been logged yet...", value: "Nothing has been logged yet..." }];

function filterAndMapAutocompletion(interaction: AutocompleteInteraction, input: string[]) {
	return input
		.filter((c) => c.startsWith(interaction.options.getFocused().toLowerCase() as string))
		.map((c) => ({
			name: c
				.replace(/(\b\w)/g, (e) => e.toUpperCase())
				.trim()
				.slice(0, 100),
			value: c.slice(0, 100),
		}));
}
