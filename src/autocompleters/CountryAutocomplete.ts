import { Autocompleter } from "../Autocompleter";
import { AutocompleteInteraction } from "discord.js";
import { typeOfCountryProperty } from "../util/countryCommand/countryDataManager";
import { countryData } from "../util/countryCommand/countryDataLoader";
import { CountryKey } from "../util/countryCommand/typesCountryCommand";
import { logger } from "../logger";
import { returnChoiceWithSameValues } from "../util/countryCommand/generalCountryCommandUtil";

class CountryAutocompleter extends Autocompleter {
	constructor() {
		super("country-info");
	}

	async execute(interaction: AutocompleteInteraction): Promise<void> {
		if (countryData.length === 0) {
			logger.debug("can't autocomplete because the country data is still being initialized");
			await interaction.respond([
				{ name: "I can't autocomplete because the data is still being initialized", value: "-" },
			]);
			return;
		}

		const input = interaction.options.getFocused() as string;

		if (interaction.options.getSubcommand() == "query") {
			this.queryAutocompletion(interaction, input);
			return;
		}

		// any other command only needs the default country autocompletion
		const matchingCountries: string[] = countryData
			.map((c) => c.name)
			.filter((t) => t.toLowerCase().startsWith(input.toLowerCase()));

		await interaction.respond(matchingCountries.map(returnChoiceWithSameValues).slice(0, 25));
	}

	async queryAutocompletion(interaction: AutocompleteInteraction, input: string) {
		// autocomplete the choices for the filtering
		const criteria: CountryKey = (interaction.options.getString("filter-criteria") ?? "population") as CountryKey;

		if ((criteria as string) === "none") {
			await interaction.respond([returnChoiceWithSameValues("none")]);
			return;
		}

		const criteriaType: string = typeOfCountryProperty(criteria);
		if (criteriaType === "number") {
			if (input !== "") {
				await interaction.respond([{ name: input, value: input }]);
			} else {
				await interaction.respond([
					{ name: "please input a number", value: "0" },
					returnChoiceWithSameValues("100e6"),
					returnChoiceWithSameValues("10e6"),
					returnChoiceWithSameValues("1e6"),
					returnChoiceWithSameValues("100000"),
					returnChoiceWithSameValues("10000"),
					returnChoiceWithSameValues("1000"),
					returnChoiceWithSameValues("0"),
				]);
			}
		} else if (criteriaType === "string" || criteriaType === "object") {
			let options: string[] = countryData.flatMap((c) => c[criteria]) as string[];
			options = options.filter((t) => t.toLowerCase().startsWith(input.toLowerCase()));

			// removes the duplicates
			options = [...new Set(options)];

			await interaction.respond(options.map(returnChoiceWithSameValues).slice(0, 25));
		} else if (criteriaType === "boolean") {
			await interaction.respond([returnChoiceWithSameValues("true"), returnChoiceWithSameValues("false")]);
		}
	}
}

export default new CountryAutocompleter();
