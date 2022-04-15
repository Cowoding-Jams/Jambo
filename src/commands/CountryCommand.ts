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
				const country: Country | undefined = getCountryWithCode(interaction.options.getString("country") ?? "BT");
				if (country == undefined) {
					countryUndefinedReply(interaction);
					break;
				}
				interaction.reply({ embeds: [getOverviewEmbed(country)] });

				break;
			}
			case "specific": {
				const country: Country | undefined = getCountryWithCode(interaction.options.getString("country") ?? "BT");
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

				const sorting: { [id: string]: (c: Country[]) => [string, number][] } = {
					population: (data: Country[]) =>
						data.sort((a, b) => a.population - b.population).map((c) => [c.name.common, c.population]),
					area: (data: Country[]) => data.sort((a, b) => a.area - b.area).map((c) => [c.name.common, c.area]),
					latitude: (data: Country[]) =>
						data.sort((a, b) => b.latlng[0] - a.latlng[0]).map((c) => [c.name.common, c.latlng[0]]),
					longitude: (data: Country[]) =>
						data.sort((a, b) => b.latlng[1] - a.latlng[1]).map((c) => [c.name.common, c.latlng[1]]),
				};

				const list: [string, number][] = sorting[criteria](countryData);
				if (order === "descending") {
					list.reverse();
				}
				interaction.reply({ embeds: [getSortEmbed(list.slice(0, scale), criteria, order, includeData)] });
				break;
			}
			/* case "group": {
					const criteria = interaction.options.getString("criteria") ?? "hemisphere";
	
					const embed: { [id: string]: MessageEmbed } = {
						"un": getGroupEmbed(
							[countryData.filter((c) => c.unMember), countryData.filter((c) => !c.unMember)],
							["UN-Member", "Not a UN-Member"],
							"UN-Membership"
						),
						"hemisphere": getGroupEmbed(
							[countryData.filter((c) => (c.latlng[0] > 0)), countryData.filter((c) => !(c.latlng[0] > 0))],
							["Northern Hemisphere", "Southern Hemisphere"],
							"hemisphere"
						)
					}
	
					interaction.reply({ embeds: [embed[criteria]] });
					break;
				}
				case "filter": {
	
					break;
				} */
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
			);
		/* .addSubcommand((option) =>
				option
					.setName("group")
					.setDescription("lets you group the countries with queries")
					.addStringOption((option) =>
						option
							.setName("criteria")
							.setDescription("criteria to sort by")
							.addChoice("un-membership", "un")
							.addChoice("hemisphere", "hemisphere")
							.setRequired(true)
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
							.addChoice("area", "area")
							.addChoice("latitude (north -> south)", "latitude (north -> south)")
							.addChoice("longitude (east -> west)", "longitude (east -> west)")
							.setRequired(true)
					)
			) */
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

function getSortEmbed(
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

/* function getGroupEmbed(
	grouped: Country[][],
	titles: string[],
	criteria: string,
): MessageEmbed {
	let embed: MessageEmbed = new MessageEmbed()
		.setTitle(`Countries grouped by ${criteria}`)
		.setAuthor({
			name: "Made by me, Jambo :)",
			iconURL: "https://raw.githubusercontent.com/Cowoding-Jams/Jambo/main/images/Robot-lowres.png",
			url: "https://github.com/Cowoding-Jams/Jambo",
		})
		.setColor("#F0A5AC")
		.setTimestamp();

	return embed;
} */

function countryUndefinedReply(interaction: CommandInteraction) {
	interaction.reply({
		content: "I've never heard of that country... Next time pick one from the list, okay?",
		ephemeral: true,
	});
}

function getCountryOption(option: SlashCommandStringOption) {
	return option.setName("country").setDescription("name of the country").setRequired(true).setAutocomplete(true);
}
