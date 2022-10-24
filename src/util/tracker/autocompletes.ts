import { AutocompleteInteraction } from "discord.js";
import { activityTrackerBlacklistDb, activityTrackerLogDb } from "../../db";

export async function adminWhitelistgame(interaction: AutocompleteInteraction) {
	if (!interaction.memberPermissions?.has("Administrator")) {
		await interaction.respond([
			{
				name: "You dont have permissions to use this command",
				value: "You dont have permissions to use this command",
			},
		]);
		return;
	}

	let options: string[] | undefined = activityTrackerBlacklistDb.get("general-game");

	options = [...new Set(options)];

	if (options?.length === 0 || !options) {
		await interaction.respond([
			{
				name: "Global blacklist is empty",
				value: "Global blacklist is empty",
			},
		]);
		return;
	}

	let map = options
		.filter((c) => c.toLowerCase().startsWith(interaction.options.getFocused().toLowerCase() as string))
		.map((c) => ({ name: c, value: c }));

	if (map.length > 25) {
		map = map.slice(0, 25);
	}

	await interaction.respond(map);
}

export async function statisticsMystats(interaction: AutocompleteInteraction) {
	const allKeys = activityTrackerLogDb.keyArray();
	let games: string[] = [];
	allKeys.forEach((e) => {
		const split = e.split("-");
		if (split[0] !== interaction.user.id) return;
		games.push(split[1]);
	});

	games = [...new Set(games)];

	if (games.length == 0) {
		await interaction.respond([
			{ name: "Nothing has been logged yet", value: "Nothing has been logged yet" },
		]);
		return;
	}

	let map = games
		.filter((c) => c.toLowerCase().startsWith(interaction.options.getFocused().toLowerCase() as string))
		.map((c) => ({ name: c, value: c }));

	if (map.length > 25) {
		map = map.slice(0, 25);
	}

	await interaction.respond(map);
}

export async function statisticsGamestats(interaction: AutocompleteInteraction) {
	const allKeys = activityTrackerLogDb.keyArray();
	let games: string[] = [];
	allKeys.forEach((e) => {
		const split = e.split("-");
		games.push(split[1]);
	});

	games = [...new Set(games)];

	if (games.length == 0) {
		await interaction.respond([
			{ name: "Nothing has been logged yet", value: "Nothing has been logged yet" },
		]);
		return;
	}

	let map = games
		.filter((c) => c.toLowerCase().startsWith(interaction.options.getFocused().toLowerCase() as string))
		.map((c) => ({ name: c, value: c }));

	if (map.length > 25) {
		map = map.slice(0, 25);
	}

	await interaction.respond(map);
}

export async function blacklistRemove(interaction: AutocompleteInteraction) {
	let options: string[] | undefined = activityTrackerBlacklistDb.get(interaction.user.id);

	options = [...new Set(options)];

	if (activityTrackerBlacklistDb.get("general-user")?.includes(interaction.user.id)) {
		await interaction.respond([
			{
				name: "Tracking is disabled, select this to activate it again",
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

	let map = options
		.filter((c) => c.toLowerCase().startsWith(interaction.options.getFocused().toLowerCase() as string))
		.map((c) => ({ name: c, value: c }));

	if (map.length > 25) {
		map = map.slice(0, 25);
	}

	await interaction.respond(map);
}