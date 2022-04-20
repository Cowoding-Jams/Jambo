import { Autocompleter } from "../Autocompleter";
import { ApplicationCommandOptionChoice, AutocompleteInteraction } from "discord.js";
import { Country, countryData, CountryKey, typeOfCountryProperty } from "../util/countryUtil/dataManager";

class CountryAutocompleter extends Autocompleter {
	countryNames: string[] = countryData.map((c: Country) => c.name);

	constructor() {
		super("country");
	}

	async execute(interaction: AutocompleteInteraction): Promise<void> {
		const input = interaction.options.getFocused() as string;

		if (interaction.options.getSubcommand() == "query") {
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

			return;
		}

		// any other command only needs the default country autocompletion
		const matchingCountries: string[] = this.countryNames.filter((t) =>
			t.toLowerCase().startsWith(input.toLowerCase())
		);

		await interaction.respond(matchingCountries.map(returnChoiceWithSameValues).slice(0, 25));
	}
}

export default new CountryAutocompleter();

function returnChoiceWithSameValues(e: string): ApplicationCommandOptionChoice {
	return { name: e, value: e };
}
