import { Autocompleter } from "../Autocompleter";
import { AutocompleteInteraction } from "discord.js";
import { countryNameAndCode } from "../util/countryUtil/dataManager";

class CountryAutocompleter extends Autocompleter {
	constructor() {
		super("country");
	}

	async execute(interaction: AutocompleteInteraction): Promise<void> {
		// for example return all options which start with the user input
		await interaction.respond(
			countryNameAndCode.filter((c) => c.name.startsWith(interaction.options.getFocused() as string)).slice(0, 25)
		);
	}
}

export default new CountryAutocompleter();
