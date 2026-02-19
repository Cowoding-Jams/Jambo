import { AutocompleteInteraction } from "discord.js";
import { Autocompleter } from "../interactions/interactionClasses.js";

class CountryAutocompleter extends Autocompleter {
	constructor() {
		super("country"); // command which this autocompleter is for
	}

	async execute(interaction: AutocompleteInteraction): Promise<void> {
		// your options
		const country = ["Finland", "Sweden", "Norway"];

		// for example filter for options which start with the user input
		let filteredOptions = country.filter((c) =>
			c
				// to make sure capitalisaion doesnt matter, make every option to lower case
				.toLowerCase()
				.startsWith(
					// the same with the user input
					interaction.options.getFocused().toLowerCase() as string
				)
		);

		// if the filterd options are more than 25 remove everything after the 25th option
		// because discord only allows 25 autocomplete results
		if (filteredOptions.length > 25) filteredOptions = filteredOptions.slice(0, 25);

		// map filtered options
		const map = filteredOptions.map((c) => ({ name: c, value: c }));

		// send map back to the user
		await interaction.respond(map);
	}
}

export default new CountryAutocompleter();
