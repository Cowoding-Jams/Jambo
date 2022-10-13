import { Command } from "../handler";
import {
	ChatInputCommandInteraction,
	SlashCommandBuilder,
	SlashCommandStringOption,
	SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";
import { countryData, initializeCountryData } from "../util/countryCommand/countryDataLoader";
import {
	overviewSubcommand,
	randomOverviewSubcommand,
} from "../util/countryCommand/overviewSubcommand";
import { specificCommand } from "../util/countryCommand/specificSubcommand";
import { querySubcommand } from "../util/countryCommand/querySubcommand";
import { unknownSubcommandReply } from "../util/unknownSubcommand";

class CountryInfoCommand extends Command {
	constructor() {
		super("country-info");
		initializeCountryData();
	}

	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		if (countryData.length === 0) {
			interaction.reply({
				content: "Still initiliazing the data, try again later...",
				ephemeral: true,
			});
			return;
		}

		switch (interaction.options.getSubcommand()) {
			case "overview": {
				overviewSubcommand(interaction);
				break;
			}
			case "random": {
				randomOverviewSubcommand(interaction);
				break;
			}
			case "specific": {
				specificCommand(interaction);
				break;
			}
			case "query": {
				querySubcommand(interaction);
				break;
			}
			default: {
				unknownSubcommandReply(interaction);
				break;
			}
		}
	}

	register(): SlashCommandSubcommandsOnlyBuilder {
		return new SlashCommandBuilder()
			.setName("country-info")
			.setDescription("Accessing country data.")
			.addSubcommand((option) =>
				option
					.setName("overview")
					.setDescription("Lists all the data from a country.")
					.addStringOption(getCountryOption)
			)
			.addSubcommand((option) =>
				option.setName("random").setDescription("Lists all the data from a random country.")
			)
			.addSubcommand((option) =>
				option
					.setName("specific")
					.setDescription("Gives you a specific information about a country.")
					.addStringOption((option) =>
						option
							.setName("info")
							.setDescription("The piece of data you want.")
							.addChoices(
								{ name: "flag", value: "flag" },
								{ name: "google maps", value: "map" },
								...defaultCountryInformationChoices.slice(1)
							)
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
							.addChoices(
								{ name: "none", value: "none" },

								...defaultCountryInformationChoices
							)
							.setRequired(true)
					)
					.addStringOption((option) =>
						option
							.setName("order")
							.setDescription("Determines the order.")
							.addChoices(
								{ name: "ascending", value: "ascending" },
								{ name: "descending", value: "descending" }
							)
							.setRequired(true)
					)
					.addIntegerOption((option) =>
						option
							.setName("scale")
							.setDescription("Set which part you want to see.")
							.addChoices(
								{ name: "top 10", value: 10 },
								{ name: "top 25", value: 25 },
								{ name: "top 50", value: 50 },
								{ name: "top 100", value: 100 },
								{ name: "all", value: 400 }
							)
							.setRequired(true)
					)
					.addStringOption((option) =>
						option
							.setName("filter-criteria")
							.setDescription("Criteria to filter by.")
							.addChoices(
								{ name: "none", value: "none" },

								...defaultCountryInformationChoices
							)
							.setRequired(true)
					)
					.addStringOption((option) =>
						option
							.setName("relation")
							.setDescription("Relation to test the criteria on.")
							.addChoices(
								{ name: "equals (==)", value: "eq" },
								{ name: "less then (<)", value: "l" },
								{ name: "greater then (>)", value: "g" },
								{ name: "less & equal then (<=)", value: "le" },
								{ name: "greater & equal then (>=)", value: "ge" }
							)
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
						option
							.setName("include-data")
							.setDescription("Set whether or not the list includes the data.")
					)
			);
	}
}

function getCountryOption(option: SlashCommandStringOption) {
	return option
		.setName("country")
		.setDescription("Name of the country.")
		.setRequired(true)
		.setAutocomplete(true);
}

const defaultCountryInformationChoices: { name: string; value: string }[] = [
	{ name: "name", value: "name" },
	{ name: "official_name", value: "official_name" },
	{ name: "cca2", value: "cca2" },
	{ name: "tld", value: "tld" },
	{ name: "unMember", value: "unMember" },
	{ name: "population", value: "population" },
	{ name: "capital", value: "capital" },
	{ name: "languages", value: "languages" },
	{ name: "currencies", value: "currencies" },
	{ name: "timezones", value: "timezones" },
	{ name: "region", value: "region" },
	{ name: "subregion", value: "subregion" },
	{ name: "latitude", value: "latitude" },
	{ name: "longitude", value: "longitude" },
	{ name: "area", value: "area" },
];

export default new CountryInfoCommand();
