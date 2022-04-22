import { Command } from "../Command";
import { CommandInteraction, MessageEmbed } from "discord.js";
import {
	inlineCode,
	SlashCommandBuilder,
	SlashCommandStringOption,
	SlashCommandSubcommandsOnlyBuilder,
} from "@discordjs/builders";
import {
	Country,
	countryData,
	CountryKey,
	getCountryByName,
	getFilteredCountryDataBy,
	initializeCountryData,
	sortCountryDataBy,
	typeOfCountryProperty,
} from "../util/countryDataManager";
import { formatNumber } from "../util/numbers"
import { addDefaultEmbedFooter } from "util/embeds";
import { pickRandomFromList, shuffleList } from "util/random";

let locale: string = "";

class CountryCommand extends Command {
	constructor() {
		super("country");
		initializeCountryData();
	}

	async execute(interaction: CommandInteraction): Promise<void> {
		locale = interaction.locale;

		if (countryData.length === 0) {
			interaction.reply({ content: "Still initiliazing the data, try again later...", ephemeral: true });
			return;
		}

		const country: Country | undefined = getCountryByName(interaction.options.getString("country") ?? "Bhutan");
		switch (interaction.options.getSubcommand()) {
			case "overview": {
				if (country) {
					interaction.reply({ embeds: [getOverviewEmbed(country)] });
				} else {
					countryUndefinedReply(interaction);
				}
				break;
			}
			case "random": {
				interaction.reply({ embeds: [getOverviewEmbed(pickRandomFromList(countryData))] });
				break;
			}
			case "specific": {
				const info: string = interaction.options.getString("info") ?? "population";

				if (country) {
					interaction.reply(specificRequestReplies[info](country));
				} else {
					countryUndefinedReply(interaction);
				}
				break;
			}
			case "query": {
				const sortCriteria: CountryKey = (interaction.options.getString("sort-criteria") ?? "none") as CountryKey;
				const order = interaction.options.getString("order") ?? "ascending";
				const scale = interaction.options.getInteger("scale") ?? 10;
				const filterCriteria: CountryKey = (interaction.options.getString("filter-criteria") ?? "none") as CountryKey;
				const relation = interaction.options.getString("relation") ?? "eq";
				let filterValue: string | boolean | number = interaction.options.getString("filter-value") ?? "";
				let includeData = interaction.options.getBoolean("include-data") ?? true;
				let numbered = false;
				let embedDataCriteria: CountryKey = sortCriteria;

				// sorting
				if ((sortCriteria as string) !== "none") {
					numbered = true;
					sortCountryDataBy(sortCriteria);
					if (order === "descending") {
						countryData.reverse();
					}
				} else {
					shuffleList(countryData);
					includeData = false;
				}

				// filtering
				let data: Country[] = countryData;
				if ((filterCriteria as string) !== "none") {
					if (["true", "false"].includes(filterValue)) {
						filterValue = Boolean(filterValue);
					} else if (!isNaN(+filterValue)) {
						filterValue = +filterValue;
					}

					if (
						typeof filterValue !== typeOfCountryProperty(filterCriteria) &&
						!(typeof filterValue === "string" && typeOfCountryProperty(filterCriteria) === "object")
					) {
						thatDoesntMakeSenseReply(interaction);
						break;
					}

					includeData = true;
					data = getFilteredCountryDataBy(filterCriteria, relation, filterValue);

					if (relation !== "eq") {
						embedDataCriteria = filterCriteria;
					}
				}

				// output
				const title = `${scale > countryData.length ? "All" : `Top ${scale}`} countries ${(sortCriteria as string) !== "none" ? `listed by ${sortCriteria} in ${order} order` : "shuffeled"
					}${(filterCriteria as string) !== "none" ? `, ${filteringTitles[relation](String(filterValue), filterCriteria)}` : ""}`;
				interaction.reply({
					embeds: [
						getListEmbed(countriesToEmbedForm(data.slice(0, scale), embedDataCriteria, includeData), title, numbered),
					],
				});
				break;
			}
			default: {
				interaction.reply("Sorry, I don't know what to do... qwq");
				break;
			}
		}
	}

	register():
		| SlashCommandBuilder
		| SlashCommandSubcommandsOnlyBuilder
		| Omit<SlashCommandBuilder, "addSubcommandGroup" | "addSubcommand"> {
		return new SlashCommandBuilder()
			.setName("country")
			.setDescription("Accessing country data.")
			.addSubcommand((option) =>
				option.setName("overview").setDescription("Lists all the data from a country.").addStringOption(getCountryOption)
			)
			.addSubcommand((option) => option.setName("random").setDescription("Lists all the data from a random country."))
			.addSubcommand((option) =>
				option
					.setName("specific")
					.setDescription("gives you a specific information about a country")
					.addStringOption((option) =>
						option
							.setName("info")
							.setDescription("The piece of data you want.")
							.addChoice("flag", "flag")
							.addChoice("google maps", "map")
							.addChoices(this.countryInformationChoices.slice(1))
							.setRequired(true)
					)
					.addStringOption(getCountryOption)
			)
			.addSubcommand((option) =>
				option
					.setName("query")
					.setDescription("Lets you sort and filter the countries with queries.")
					.addStringOption((option) =>
						option
							.setName("sort-criteria")
							.setDescription("Criteria to sort by.")
							.addChoice("none", "none")
							.addChoices(this.countryInformationChoices)
							.setRequired(true)
					)
					.addStringOption((option) =>
						option
							.setName("order")
							.setDescription("Determines the order.")
							.addChoice("ascending", "ascending")
							.addChoice("descending", "descending")
							.setRequired(true)
					)
					.addIntegerOption((option) =>
						option
							.setName("scale")
							.setDescription("Set which part you want to see.")
							.addChoice("top 10", 10)
							.addChoice("top 25", 25)
							.addChoice("top 50", 50)
							.addChoice("top 100", 100)
							.addChoice("all", 400)
							.setRequired(true)
					)
					.addStringOption((option) =>
						option
							.setName("filter-criteria")
							.setDescription("Criteria to filter by.")
							.addChoice("none", "none")
							.addChoices(this.countryInformationChoices)
							.setRequired(true)
					)
					.addStringOption((option) =>
						option
							.setName("relation")
							.setDescription("Relation to test the criteria on.")
							.addChoice("equals (==)", "eq")
							.addChoice("less then (<)", "l")
							.addChoice("greater then (>)", "g")
							.addChoice("less & equal then (<=)", "le")
							.addChoice("greater & equal then (>=)", "ge")
							.setRequired(true)
					)
					.addStringOption((option) =>
						option
							.setName("filter-value")
							.setDescription("Value to use for the relation.")
							.setRequired(true)
							.setAutocomplete(true)
					)
					.addBooleanOption((option) =>
						option.setName("include-data").setDescription("Set whether or not the list includes the data.")
					)
			);
	}

	countryInformationChoices: [string, string][] = [
		["name", "name"],
		["official_name", "official_name"],
		["cca2", "cca2"],
		["tld", "tld"],
		["unMember", "unMember"],
		["population", "population"],
		["capital", "capital"],
		["languages", "languages"],
		["currencies", "currencies"],
		["timezones", "timezones"],
		["region", "region"],
		["subregion", "subregion"],
		["latitude", "latitude"],
		["longitude", "longitude"],
		["area", "area"]
	];
}

export default new CountryCommand();

function getCountryOption(option: SlashCommandStringOption) {
	return option.setName("country").setDescription("Name of the country.").setRequired(true).setAutocomplete(true);
}

function getOverviewEmbed(country: Country): MessageEmbed {
	const embed = new MessageEmbed()
		.setTitle(country.name)
		.setThumbnail(country.flags.png)
		.setDescription(`(officially: ${country.official_name}, code: ${country.cca2})`)
		.addFields(
			{
				name: "Demographics",
				value: `- Population size: ${formatNumber(country.population, locale)} (${countryData.indexOf(country) + 1}.)
			 - Is ${!country.unMember ? "not" : ""} a member of the UN
			 - Top Level Domain: ${inlineCode(country.tld.join(" / "))}
			 - Currencie(s): ${country.currencies.join(", ")}
			 - Language(s): ${Object.values(country.languages).join(", ")}`,
			},
			{
				name: "Geographics",
				value: `- Capital: ${country.capital.join(", ")}
			 - Region: ${country.region}, Subregion: ${country.subregion}
			 - Coordinates: ${Math.round(country.latitude)}° N/S, ${Math.round(country.longitude)}° E/W
			 - Timezone(s): ${country.timezones.join(", ")}
			 - Area: ${formatNumber(country.area, locale)} km²
			 - [Google Maps](${country.maps.googleMaps})`,
			}
		);

	return addDefaultEmbedFooter(embed);
}

function getListEmbed(data: string[][], title: string, numbered: boolean): MessageEmbed {
	let des: string;
	const dataSymbol: string = (data[0].length ?? 0) > 1 ? " ⁘ " : " ";
	if (numbered) {
		des = data.map((c, index) => `${index + 1}. ${c[0]}${dataSymbol}${c.slice(1).join(", ")}`).join("\n");
	} else {
		des = data.map((c) => `- ${c[0]}${dataSymbol}${c.slice(1).join(", ")}`).join("\n");
	}

	return addDefaultEmbedFooter(new MessageEmbed()
		.setTitle(title)
		.setDescription(des)
	);
}

function countriesToEmbedForm(countries: Country[], criteria: CountryKey, includeData: boolean): string[][] {
	if (!includeData) {
		return countries.map((c) => [c.name]);
	}

	if (typeOfCountryProperty(criteria) === "number") {
		return countries.map((c) => [c.name, formatNumber(c[criteria] as number, locale)]);
	} else if (typeOfCountryProperty(criteria) === "boolean") {
		return countries.map((c) => [c.name, String(c[criteria])]);
	} else {
		return countries.map((c) => [c.name].concat(c[criteria] as ConcatArray<string>));
	}
}

function thatDoesntMakeSenseReply(interaction: CommandInteraction) {
	interaction.reply({
		content: "Now I don't want to call you dumb infront of everyone but that just makes no sense...",
		ephemeral: true,
	});
}

function countryUndefinedReply(interaction: CommandInteraction) {
	interaction.reply({
		content: "I've never heard of that country... Next time pick one from the list, okay?",
		ephemeral: true,
	});
}

const filteringTitles: { [id: string]: (value: string, criteria: CountryKey) => string } = {
	eq: (v, c) => `where its ${c} ${typeOfCountryProperty(c) === "object" ? "include" : "is"} ${v}`,
	l: (v, c) =>
		`where its ${c} ${filterTitleIncludePart(c)}${typeOfCountryProperty(c) === "string" ? " alphabetically" : ""
		} less then ${v}`,
	g: (v, c) =>
		`where its ${c} ${filterTitleIncludePart(c)}${typeOfCountryProperty(c) === "string" ? " alphabetically" : ""
		} greater then ${v}`,
	le: (v, c) =>
		`where its ${c} ${filterTitleIncludePart(c)}${typeOfCountryProperty(c) === "string" ? " alphabetically" : ""
		} less then or equal to ${v}`,
	ge: (v, c) =>
		`where its ${c} ${filterTitleIncludePart(c)}${typeOfCountryProperty(c) === "string" ? " alphabetically" : ""
		} greater then or equal to ${v}`,
};

const filterTitleIncludePart = (c: CountryKey) =>
	typeOfCountryProperty(c) === "object" ? "include a value which is alphabetically" : "is";

const specificRequestReplies: { [id: string]: (country: Country) => string | object } = {
	official_name: (country) => `The official name of ${country.name} is: ${country.official_name}`,
	flag: (country) => {
		return { content: `${country.name}'s flag:`, files: [country.flags.png] };
	},
	map: (country) => `You can find ${country.name} on google maps here: ${country.maps.googleMaps}`,
	cca2: (country) => `The cca2 code of ${country.name} is ${country.cca2}`,
	tld: (country) => `The Top Level Domain of ${country.name} is ${country.tld}`,
	unMember: (country) => `${country.name} is${country.unMember ? " " : " not "} a member of the UN`,
	population: (country) => `The population size of ${country.name} is: ${formatNumber(country.population, locale)}`,
	capital: (country) => `The capital of ${country.name} is ${country.capital}`,
	languages: (country) => `In ${country.name} these following languages are spoken: ${country.languages.join(", ")}`,
	currencies: (country) => `In ${country.name} these currencies are used: ${country.currencies.join(", ")}`,
	timezones: (country) => `${country.name} includes these timezones: ${country.timezones.join(", ")}`,
	region: (country) => `${country.name} is part of ${country.region}`,
	subregion: (country) => `${country.name} is part of ${country.subregion}`,
	latitude: (country) => `The latitude of ${country.name} is ${country.latitude}° N/S`,
	longitude: (country) => `The longitude of ${country.name} is ${country.longitude}° E/W`,
	area: (country) => `The area of ${country.name} is: ${formatNumber(country.area, locale)} km²`,
};
