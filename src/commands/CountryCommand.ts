import { Command } from "../Command";
import { CommandInteraction, MessageEmbed } from "discord.js";
import {
	inlineCode,
	SlashCommandBuilder,
	SlashCommandStringOption,
	SlashCommandSubcommandsOnlyBuilder,
} from "@discordjs/builders";
import { Country, countryData, getCountryWithCode, updateDataFromSource } from "../util/countryUtil/dataManager";

let formatNumber: (n: number) => string;

class CountryCommand extends Command {
	constructor() {
		super("country");
	}

	async execute(interaction: CommandInteraction): Promise<void> {
		const countryCode: string | null = interaction.options.getString("country");
		let country: Country = getCountryWithCode("BT"); // default country

		formatNumber = (n: number) => {
			return n.toLocaleString(interaction.locale);
		};

		if (countryCode) {
			country = getCountryWithCode(countryCode);

			if (country == undefined) {
				interaction.reply({
					content: "I've never heard of that country... Next time pick one from the list, okay?",
					ephemeral: true,
				});
				return;
			}
		}

		switch (interaction.options.getSubcommand()) {
			case "overview": {
				interaction.reply({ embeds: [getOverviewEmbed(country)] });
				break;
			}
			case "update-data": {
				updateDataFromSource();
				interaction.reply({ content: "On it!", ephemeral: false });
				break;
			}
			case "list": {
				let list: [string, number][];
				const criteria = interaction.options.getString("criteria") ?? "population";
				const order = interaction.options.getString("order") ?? "ascending";
				const scale = interaction.options.getInteger("scale") ?? 10;
				const includeData = interaction.options.getBoolean("include-data") ?? true;

				if (criteria === "population") {
					list = countryData.sort((a, b) => a.population - b.population).map((c) => [c.name.common, c.population]);
				} else if (criteria == "area") {
					list = countryData.sort((a, b) => a.area - b.area).map((c) => [c.name.common, c.area]);
				} else if (criteria == "latitude (north -> south)") {
					list = countryData.sort((a, b) => b.latlng[0] - a.latlng[0]).map((c) => [c.name.common, c.latlng[0]]);
				} else {
					// longitude (east -> west)
					list = countryData.sort((a, b) => b.latlng[1] - a.latlng[1]).map((c) => [c.name.common, c.latlng[1]]);
				}

				if (order === "descending") {
					list.reverse();
				}

				interaction.reply({ embeds: [getListEmbed(list.slice(0, scale), criteria, order, includeData)] });
				break;
			}
			case "official-name": {
				interaction.reply({
					content: `The official name of ${country.name.common} is: ${country.name.official}`,
				});
				break;
			}
			case "tld": {
				interaction.reply({
					content: `The top level domain of ${country.name.common} is: ${inlineCode(country.tld.join(" / "))}`,
				});
				break;
			}
			case "population": {
				interaction.reply({
					content: `The population of ${country.name.common} is: ${formatNumber(country.population)}`,
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
			.setDescription("accessing country data")
			.addSubcommand((option) =>
				option.setName("overview").setDescription("to get an overview over a country").addStringOption(getCountryOption)
			)
			.addSubcommand((option) =>
				option.setName("update-data").setDescription("updates the data from its online source")
			)
			.addSubcommand((option) =>
				option
					.setName("list")
					.setDescription("lets you list countries with queries")
					.addStringOption((option) =>
						option
							.setName("criteria")
							.setDescription("criteria to sort by")
							.addChoice("population", "population")
							.addChoice("area", "area")
							.addChoice("latitude (north -> south)", "latitude (north -> south)")
							.addChoice("longitude (east -> west)", "longitude (east -> west)")
							.setRequired(true)
					)
					.addStringOption((option) =>
						option
							.setName("order")
							.setDescription("determines the order")
							.addChoice("descending", "descending")
							.addChoice("ascending", "ascending")
							.setRequired(true)
					)
					.addIntegerOption((option) =>
						option
							.setName("scale")
							.setDescription("set which part you want to see")
							.addChoice("top 10", 10)
							.addChoice("top 25", 25)
							.addChoice("top 50", 50)
							.addChoice("top 100", 100)
							.addChoice("all", countryData.length)
							.setRequired(true)
					)
					.addBooleanOption((option) =>
						option.setName("include-data").setDescription("set whether or not the list includes the data")
					)
			)
			.addSubcommandGroup((option) =>
				option
					.setName("specific")
					.setDescription("to get more specific infos")
					.addSubcommand((option) =>
						option
							.setName("official-name")
							.setDescription("get a countries official name")
							.addStringOption(getCountryOption)
					)
					.addSubcommand((option) =>
						option.setName("tld").setDescription("get a countries top level domain").addStringOption(getCountryOption)
					)
					.addSubcommand((option) =>
						option.setName("population").setDescription("get a countries population").addStringOption(getCountryOption)
					)
			);
	}
}

export default new CountryCommand();

function getOverviewEmbed(country: Country): MessageEmbed {
	return new MessageEmbed()
		.setTitle(country.name.common)
		.setThumbnail(country.flags.png)
		.setDescription(`(officially: ${country.name.official}, code: ${country.cca2})`)
		.addFields(
			{
				name: "Demographics",
				value: `- Population size: ${formatNumber(country.population)}
				 - Is ${!country.unMember ? "not" : ""} a member of the UN
				 - Top Level Domain: ${inlineCode(country.tld.join(" / "))}
				 - Currencie(s): ${Object.values(country.currencies)
						.map((v) => v.name)
						.join(", ")}
				 - Language(s): ${Object.values(country.languages).join(", ")}`,
			},
			{
				name: "Geographics",
				value: `- Capital: ${country.capital.join(", ")}
				 - Region: ${country.region}, Subregion: ${country.subregion}
				 - Coordinates: ${Math.round(country.latlng[0])}° N/S, ${Math.round(country.latlng[1])}° E/W
				 - Timezone(s): ${country.timezones.join(", ")}
				 - Area: ${formatNumber(country.area)} km²
				 - [Google Maps](${country.maps.googleMaps})`,
			}
		)
		.setAuthor({
			name: "Made by me, Jambo :)",
			iconURL: "https://raw.githubusercontent.com/Cowoding-Jams/Jambo/main/images/Robot-lowres.png",
			url: "https://github.com/Cowoding-Jams/Jambo",
		})
		.setColor("#F0A5AC")
		.setTimestamp();
}

function getListEmbed(
	countries: [string, number][],
	criteria: string,
	order: string,
	includeData: boolean
): MessageEmbed {
	let titel: string;
	if (countries.length == countryData.length) {
		titel = "All";
	} else {
		titel = `Top ${countries.length}`;
	}

	let des: string;
	if (includeData) {
		des = `${countries.map((c) => `${countries.indexOf(c) + 1}. ${c[0]} - ${formatNumber(c[1])}`).join("\n")}`;
	} else {
		des = `${countries.map((c) => `${countries.indexOf(c) + 1}. ${c[0]}`).join("\n")}`;
	}

	return new MessageEmbed()
		.setTitle(`${titel} countries listed by ${criteria} in ${order} order`)
		.setDescription(des)
		.setAuthor({
			name: "Made by me, Jambo :)",
			iconURL: "https://raw.githubusercontent.com/Cowoding-Jams/Jambo/main/images/Robot-lowres.png",
			url: "https://github.com/Cowoding-Jams/Jambo",
		})
		.setColor("#F0A5AC")
		.setTimestamp();
}

function getCountryOption(option: SlashCommandStringOption) {
	return option.setName("country").setDescription("name of the country").setRequired(true).setAutocomplete(true);
}
