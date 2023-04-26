import { Autocompleter } from "../interactionClasses";
import { AutocompleteInteraction } from "discord.js";
import { trackerBlacklist, trackerGames, trackerUsers } from "../../db";
class Tracker extends Autocompleter {
	constructor() {
		super("tracker");
	}

	async execute(interaction: AutocompleteInteraction): Promise<void> {
		const sub = interaction.options.getSubcommand();
		const focus = interaction.options.getFocused().toLowerCase() as string;
		const option = interaction.options.getFocused(true).name;
		const user =
			typeof interaction.options.get("user")?.value == "string"
				? interaction.options.get("user")?.value
				: interaction.user.id;
		const game = interaction.options.get("game")?.value;
		const action =
			typeof interaction.options.get("action")?.value == "string"
				? interaction.options.get("action")?.value
				: "add";
		const options: string[] = [];

		if (sub == "user") {
			if (option == "game") {
				if (typeof user == "string") {
					if (trackerUsers.get(user)?.games) {
						trackerUsers.get(user)?.games.forEach((g) => options.push(g.id));
					} else {
						options.push("[user has not played any games yet]");
					}
				} else {
					options.push(...trackerGames.keyArray());
				}
			} else if (option == "statistic") {
				if (typeof game == "string") {
					options.push(...["playtime", "logs"]);
				} else {
					options.push(
						...["general statistics", "top 5 most played games", "top 5 most logged games", "latest 5 logs"]
					);
				}
			}
		} else if (sub == "game") {
			trackerGames.keyArray().forEach((e) => options.push(e));
		} else if (sub == "blacklist") {
			if (action == "add") {
				options.push(
					...trackerGames.keyArray().filter((e) => !trackerBlacklist.get("")?.find((e2) => e2 == e))
				);
			} else if (action == "rem") {
				options.push(
					...trackerGames.keyArray().filter((e) => !!trackerBlacklist.get("")?.find((e2) => e2 == e))
				);
			} else {
				options.push(...trackerGames.keyArray());
			}
		}

		let filteredOptions = options.filter((o) => o.toLowerCase().startsWith(focus));
		if (filteredOptions.length > 25) filteredOptions = filteredOptions.slice(0, 25);

		const map = filteredOptions.map((c) => ({ name: c, value: c }));

		await interaction.respond(map);
	}
}

export default new Tracker();
