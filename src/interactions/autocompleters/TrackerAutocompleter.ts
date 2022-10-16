import { Autocompleter } from "../interactionClasses";
import { AutocompleteInteraction } from "discord.js";
import { activityTrackerBlacklistDb, activityTrackerLogDb } from "../../db";
class TrackerAutocompleter extends Autocompleter {
	constructor() {
		super("tracker"); // command which this autocompleter is for
	}

	async execute(interaction: AutocompleteInteraction): Promise<void> {
		if (interaction.options.getSubcommandGroup() === "admin") {
			await adminWhitelistgame(interaction);
		} else if (interaction.options.getSubcommandGroup() === "statistics") {
			if (interaction.options.getSubcommand() == "mystats") await statisticsMystats(interaction);
			else if (interaction.options.getSubcommand() == "gamestats") await statisticsGamestats(interaction);
		} else if (interaction.options.getSubcommandGroup() === "blacklist") {
			await blacklistRemove(interaction);
		}
	}
}

export default new TrackerAutocompleter();

async function adminWhitelistgame(interaction: AutocompleteInteraction) {
	if (!interaction.memberPermissions?.has("Administrator")) {
		await interaction.respond([
			{
				name: "You dont have permissions to use this command",
				value: "You dont have permissions to use this command",
			},
		]);
		return;
	}

	const options: string[] | undefined = activityTrackerBlacklistDb.get("general-game");

	if (options?.length === 0 || !options) {
		await interaction.respond([
			{
				name: "No games are currently blacklisted globaly",
				value: "No games are currently blacklisted globaly",
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

async function statisticsMystats(interaction: AutocompleteInteraction) {
	const allKeys = activityTrackerLogDb.keyArray();
	const games: string[] = [];
	allKeys.forEach((e) => {
		const split = e.split("-");
		if (split[0] !== interaction.user.id) return;
		games.push(split[1]);
	});

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

async function statisticsGamestats(interaction: AutocompleteInteraction) {
	const allKeys = activityTrackerLogDb.keyArray();
	const games: string[] = [];
	allKeys.forEach((e) => {
		const split = e.split("-");
		games.push(split[1]);
	});

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

async function blacklistRemove(interaction: AutocompleteInteraction) {
	const options: string[] | undefined = activityTrackerBlacklistDb.get(interaction.user.id);

	if (activityTrackerBlacklistDb.get("general-user")?.includes(interaction.user.id)) {
		await interaction.respond([
			{ name: "Please activate my tracking again", value: "Please activate my tracking again" },
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
