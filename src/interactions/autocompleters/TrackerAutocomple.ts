import { Autocompleter } from "../interactionClasses";
import { AutocompleteInteraction } from "discord.js";
import { trackerGames } from "../../db";

class Tracker extends Autocompleter {
	constructor() {
		super("tracker");
	}

	async execute(interaction: AutocompleteInteraction): Promise<void> {
		const games = Array.from(trackerGames.keys());
		const focus = interaction.options.getFocused().toLowerCase() as string;
		let filteredOptions = games.filter((g) => g.toLowerCase().startsWith(focus));
		if (filteredOptions.length > 25) filteredOptions = filteredOptions.slice(0, 25);

		const map = filteredOptions.map((c) => ({ name: c, value: c }));

		await interaction.respond(map);
	}
}

export default new Tracker();
