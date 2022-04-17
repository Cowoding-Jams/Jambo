import { Command } from "../Command";
import { CommandInteraction, MessageEmbed } from "discord.js";
import {
	inlineCode,
	SlashCommandBuilder,
	SlashCommandStringOption,
	SlashCommandSubcommandsOnlyBuilder,
} from "@discordjs/builders";
import { updateDataFromSource, filterCountryDataWithValue, reduceCountryData, getCountryWithItsCCA2, sortCountryData, Country, countryData, relations } from "../util/countryUtil/dataManager";
import { filterInputType } from "../autocompleters/CountryAutocomplete";

export let formatNumber: (n: number) => string;

class CountryCommand extends Command {
	constructor() {
		super("country");
	}

	async execute(interaction: CommandInteraction): Promise<void> {
		formatNumber = (n: number) => {
			return n.toLocaleString(interaction.locale);
		};

		switch (interaction.options.getSubcommand()) {
			case "update-data": {
				updateDataFromSource();
				interaction.reply({ content: "On it!", ephemeral: false });
				break;
			}
			case "overview": {
				const country: Country | undefined = getCountryWithItsCCA2(interaction.options.getString("country") ?? "BT");
				if (country == undefined) {
					countryUndefinedReply(interaction);
					break;
				}
				interaction.reply({ embeds: [getOverviewEmbed(country)] });
				break;
			}
			case "random": {
				const country: Country = countryData[Math.floor(Math.random() * countryData.length)];
				interaction.reply({ embeds: [getOverviewEmbed(country)] });
				break;
			}
			case "specific": {
				const country: Country | undefined = getCountryWithItsCCA2(interaction.options.getString("country") ?? "BT");
				const info: string = interaction.options.getString("info") ?? "population";
				if (country == undefined) {
					countryUndefinedReply(interaction);
					break;
				}

				const name = country.name.common;
				const replies: { [id: string]: string | object } = {
					name: `The official name of ${name} is: ${country.name.official}`,
					capital: `The capital of ${name}`,
					flag: { content: `${name}'s flag:`, files: [country.flags.png] },
					population: `The population size of ${name} is: ${formatNumber(country.population)}`,
					area: `The area of ${name} is: ${formatNumber(country.area)} km²`,
				};

				interaction.reply(replies[info]);
				break;
			}
			case "sort": {
				const criteria = interaction.options.getString("criteria") ?? "population";
				const order = interaction.options.getString("order") ?? "ascending";
				const scale = interaction.options.getInteger("scale") ?? 10;
				const includeData = interaction.options.getBoolean("include-data") ?? true;

				sortCountryData[criteria]()
				const list = reduceCountryData[criteria]();
				if (order === "descending") {
					list.reverse();
				}

				if (includeData == false) {
					list.map((c) => c[0])
				}

				let title: string;
				if (list.length == countryData.length) {
					title = `All countries listed by ${criteria} in ${order} order`;
				} else {
					title = `Top ${list.length} countries listed by ${criteria} in ${order} order`;
				}

				interaction.reply({ embeds: [getListEmbed(list.slice(0, scale), title, true)] });
				break;
			}
			case "filter": {
				const criteria = interaction.options.getString("criteria") ?? "population";
				const relation = interaction.options.getString("relation") ?? "eq";
				const value = interaction.options.getString("value") ?? "10000";
				let num: number;

				if (filterInputType[criteria] == "data") {
					if (relation !== "eq") {
						thatDoesntMakeSense(interaction);
						break;
					}

					filterCountryDataWithValue[criteria](relations[relation], value)
					let data = reduceCountryData[criteria]();

					interaction.reply({ embeds: [getListEmbed(data, filterTitles[criteria](value), false)] });

				} else if (filterInputType[criteria] == "num") {
					if (!isNaN(+value)) {
						num = +value;
					} else {
						thatDoesntMakeSense(interaction);
						break;
					}

					let data: [string, string][] = reduceCountryData[criteria](sortCountryData[criteria](countryData)) as [string, string][];
					let rel: string = "";
					if (relation === "eq") {
						data = data.filter((c) => (c[0] === formatNumber(num)));
						rel = "equal to"
					} else if (relation === "l") {
						data = data.filter((c) => (c[0] < formatNumber(num)));
						rel = "less then"
					} else if (relation === "b") {
						data = data.filter((c) => (c[0] > formatNumber(num)));
						rel = "greater then"
					}

					interaction.reply({ embeds: [getListEmbed(data, `Every country with a ${criteria} ${rel} ${formatNumber(num)}`, false)] });
				}

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
				option.setName("update-data").setDescription("updates the data from its online source")
			)
			.addSubcommand((option) =>
				option.setName("overview").setDescription("lists all the data from a country").addStringOption(getCountryOption)
			)
			.addSubcommand((option) =>
				option.setName("random").setDescription("lists all the data from a random country")
			)
			.addSubcommand((option) =>
				option
					.setName("specific")
					.setDescription("gives you a specific info about a country")
					.addStringOption((option) =>
						option
							.setName("info")
							.setDescription("the piece of data you want")
							.addChoice("official-name", "name")
							.addChoice("capital", "capital")
							.addChoice("flag", "flag")
							.addChoice("population size", "population")
							.addChoice("area", "area")
							.setRequired(true)
					)
					.addStringOption(getCountryOption)
			)
			.addSubcommand((option) =>
				option
					.setName("sort")
					.setDescription("lets you sort the countries with queries")
					.addStringOption((option) =>
						option
							.setName("criteria")
							.setDescription("criteria to sort by")
							.addChoice("population", "population")
							.addChoice("area", "area")
							.addChoice("latitude (north -> south)", "latitude")
							.addChoice("longitude (east -> west)", "longitude")
							.setRequired(true)
					)
					.addStringOption((option) =>
						option
							.setName("order")
							.setDescription("determines the order")
							.addChoice("ascending", "ascending")
							.addChoice("descending", "descending")
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
			.addSubcommand((option) =>
				option
					.setName("filter")
					.setDescription("lets you filter the countries with queries")
					.addStringOption((option) =>
						option
							.setName("criteria")
							.setDescription("criteria to filter by")
							.addChoice("population", "population")
							.addChoice("language", "language")
							.addChoice("currency", "currency")
							.addChoice("region", "region")
							.addChoice("subregion", "subregion")
							.addChoice("timezone", "timezone")
							.addChoice("area", "area")
							.addChoice("latitude", "latitude")
							.addChoice("longitude", "longitude")
							.setRequired(true)
					)
					.addStringOption((option) =>
						option
							.setName("relation")
							.setDescription("relation to test the criteria on")
							.addChoice("equals (==)", "eq")
							.addChoice("less then (<)", "l")
							.addChoice("bigger then (>)", "b")
							.addChoice("less & equal then (<=)", "le")
							.addChoice("bigger & equal then (>=)", "be")
							.setRequired(true)
					)
					.addStringOption((option) =>
						option
							.setName("value")
							.setDescription("value to use for the relation")
							.setRequired(true)
							.setAutocomplete(true)
					)
			);
	}
}

export default new CountryCommand();

function thatDoesntMakeSense(interaction: CommandInteraction) {
	interaction.reply({ content: "Now I don't want to call you dumb infront of everyone but that just makes no sense...", ephemeral: true });
}

const filterTitles: { [id: string]: (v: string) => string } = {
	"language": (v) => `Every country where ${v} is spoken`,
	"currency": (v) => `Every country where ${v} is used as a currency`,
	"region": (v) => `Every country in ${v}`,
	"subregion": (v) => `Every country where ${v} is spoken`,
	"timezone": (v) => `Every country where ${v} is spoken`
}

function getOverviewEmbed(country: Country): MessageEmbed {
	return new MessageEmbed()
		.setTitle(country.name.common)
		.setThumbnail(country.flags.png)
		.setDescription(`(officially: ${country.name.official}, code: ${country.cca2})`)
		.addFields(
			{
				name: "Demographics",
				value: `- Population size: ${formatNumber(country.population)} (${countryData.indexOf(country) + 1}.)
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
	countries: string[][],
	title: string,
	numbered: boolean
): MessageEmbed {
	let des: string;
	if (numbered) {
		des = countries.map((c, index) => `${index + 1}. ${c.join(" - ")}`).join("\n");
	} else {
		des = countries.map((c) => `- ${c.join(" - ")}`).join("\n");
	}

	return new MessageEmbed()
		.setTitle(title)
		.setDescription(des)
		.setAuthor({
			name: "Made by me, Jambo :)",
			iconURL: "https://raw.githubusercontent.com/Cowoding-Jams/Jambo/main/images/Robot-lowres.png",
			url: "https://github.com/Cowoding-Jams/Jambo",
		})
		.setColor("#F0A5AC")
		.setTimestamp();
}

function countryUndefinedReply(interaction: CommandInteraction) {
	interaction.reply({
		content: "I've never heard of that country... Next time pick one from the list, okay?",
		ephemeral: true,
	});
}

function getCountryOption(option: SlashCommandStringOption) {
	return option.setName("country").setDescription("name of the country").setRequired(true).setAutocomplete(true);
}
