import { Autocompleter } from "../interactionClasses";
import { AutocompleteInteraction } from "discord.js";

class PollAutocompleter extends Autocompleter {
	constructor() {
		super("poll");
	}

	async execute(interaction: AutocompleteInteraction): Promise<void> {
		// your options
		const country = ["Finland", "Sweden", "Norway"];
		// for example return all options which start with the user input
		await interaction.respond(
			country
				.filter((c) => c.startsWith(interaction.options.getFocused() as string))
				.map((c) => ({ name: c, value: c }))
		);
	}
}

export default new PollAutocompleter();
