import { Autocompleter } from "../Autocompleter";
import { AutocompleteInteraction } from "discord.js";
import { countryData, Country, nameAndValue } from "../util/countryUtil/dataManager";

class CountryAutocompleter extends Autocompleter {
	countryNameAndCode: { name: string, value: string }[] = countryData.map((c: Country) => { return { name: c.name.common, value: c.cca2 } });
	countryChoices: [name: string, value: string][] = this.countryNameAndCode.map((c) => [c.name, c.value]) as [
		name: string,
		value: string
	][];

	constructor() {
		super("country");
	}

	async execute(interaction: AutocompleteInteraction): Promise<void> {
		if (interaction.options.getSubcommand() == "filter") {
			const criteria: string = interaction.options.getString("criteria") ?? "population";

			if (filterInputType[criteria] == "num") {
				const input = interaction.options.getFocused() as string;
				if (input !== "") {
					await interaction.respond([{ name: input, value: input }])
				} else {
					await interaction.respond([])
				}

			} else {
				await interaction.respond(
					this.extractAutocompletionData(criteria)
						.filter((c) =>
							c.name.toLowerCase().startsWith((interaction.options.getFocused() as string).toLowerCase())
						)
						.slice(0, 25)
				);
			}

		} else {
			// any other command only needs the default country autocompletion
			await interaction.respond(
				this.countryNameAndCode
					.filter((c) =>
						c.name.toLowerCase().startsWith((interaction.options.getFocused() as string).toLowerCase())
					)
					.slice(0, 25)
			);
		}

	}

	extractAutocompletionData(criteria: string): { name: string, value: string }[] {
		let returnValue: nameAndValue[] = [];
		switch (criteria) {
			case "language":
				returnValue = countryData.flatMap((c) => {
					return Object.values(c.languages).map(returnNameAndValueSame);
				})
				break;
			case "currency":
				returnValue = countryData.flatMap((c) => {
					return Object.values(c.currencies).map((co) => returnNameAndValueSame(co.name));
				})
				break;
			case "region":
				returnValue = countryData.map((c) => returnNameAndValueSame(c.region));
				break;
			case "subregion":
				returnValue = countryData.map((c) => returnNameAndValueSame(c.subregion));
				break;
			case "timezone":
				returnValue = countryData.flatMap((c) => {
					return c.timezones.map(returnNameAndValueSame);
				});
				break;
		}

		// filtering undefined values
		returnValue = returnValue.filter((c) => (c.name !== undefined && c !== undefined));

		// removes the duplicates
		return returnValue.filter((c, index) => {
			return returnValue.findIndex((o) => (o.name == c.name)) === index;
		}) as { name: string, value: string }[];
	}
}

export default new CountryAutocompleter();

// the type of input is needed for the autocompletion for the specific criteria
export const filterInputType: { [id: string]: string } = {
	"population": "num",
	"language": "data",
	"currency": "data",
	"region": "data",
	"subregion": "data",
	"timezone": "data",
	"area": "num",
	"latitude": "num",
	"longitude": "num"
}

function returnNameAndValueSame(e: string): nameAndValue {
	return { name: e, value: e }
}