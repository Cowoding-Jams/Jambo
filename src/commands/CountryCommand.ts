import { Command } from "../Command";
import { CommandInteraction } from "discord.js";
import { SlashCommandBuilder, SlashCommandStringOption, SlashCommandSubcommandsOnlyBuilder } from "@discordjs/builders";
import { countryData, initializeCountryData } from "../util/countryCommand/countryDataManager";
import { overviewSubcommand, randomOverviewSubcommand } from "util/countryCommand/overviewSubcommand";
import { specificCommand } from "util/countryCommand/specificSubcommand";
import { querySubcommand } from "util/countryCommand/querySubcommand";

class CountryCommand extends Command {
	constructor() {
		super("country");
		initializeCountryData();
	}

	async execute(interaction: CommandInteraction): Promise<void> {
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
				interaction.reply({
					content: "Sorry, I don't know what to do... I've never heard of that subcommand.",
					ephemeral: true,
				});
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
				option
					.setName("overview")
					.setDescription("Lists all the data from a country.")
					.addStringOption(getCountryOption)
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
							.addChoices(defaultCountryInformationChoices.slice(1))
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
							.addChoices(defaultCountryInformationChoices)
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
							.addChoices(defaultCountryInformationChoices)
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
}

function getCountryOption(option: SlashCommandStringOption) {
	return option.setName("country").setDescription("Name of the country.").setRequired(true).setAutocomplete(true);
}

const defaultCountryInformationChoices: [string, string][] = [
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
	["area", "area"],
];

export default new CountryCommand();
