import { Command } from "../Command";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { inlineCode, SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from "@discordjs/builders";
import fetch from "node-fetch";
import { logger } from "../logger";
import fs from "fs";
import data from "../util/countryData.json";

interface Country {
	name: { common: string; official: string };
	cca2: string;
	tld: string[];
	population: number;
	capital: string[];
	currencies: object;
	unMember: boolean;
	latlng: number[];
	area: number;
	maps: { googleMaps: string; openStreetMaps: string };
	timezones: string[];
	flags: { png: string; svg: string };
}

class CountryCommand extends Command {
	countryData: Country[] = [];

	constructor() {
		super("country-info");
		this.countryData = data as Country[];
		this.countryData = this.sortedByPopulation();

		/* if (fs.existsSync("../util/countryData.json")) {
            this.updateDataFromSource();
        } else {
        } */
	}

	async execute(interaction: CommandInteraction): Promise<void> {
		const countryCode: string = interaction.options.getString("country") || "UY";
		const country: Country = this.getCountryWithCode(countryCode);
		switch (interaction.options.getSubcommand()) {
			case "overview": {
				const embed = new MessageEmbed()
					.setTitle(country.name.common)
					.setThumbnail(country.flags.png)
					.setDescription(`(officially: ${country.name.official}, code: ${country.cca2})`)
					.addFields(
						{
							name: "Demographics",
							value: `- Population size: ${country.population.toLocaleString("de-DE")}
                                 - Is ${!country.unMember ? "not" : ""} a member of the UN
                                 - Top Level Domain: ${inlineCode(country.tld.join(" / "))}
                                 - Currencie(s): ${Object.values(country.currencies)
																		.map((v) => v.name)
																		.join(", ")}`,
						},
						{
							name: "Geographics",
							value: `- Capital: ${country.capital.join(", ")}
                                 - Coordinates: ${country.latlng[0]}° N/S, ${country.latlng[1]}° E/W
                                 - Timezone(s): ${country.timezones.join(", ")}
                                 - Area: ${country.area.toLocaleString("de-DE")} km²
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

				interaction.reply({
					embeds: [embed],
				});
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
					content: `The population of ${country.name.common} is: ${country.population.toLocaleString("de-DE")}`,
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
			.setName("country-info")
			.setDescription("lets you access country specific data")
			.addSubcommand((option) =>
				option
					.setName("overview")
					.setDescription("gives you an overview")
					.addStringOption((option) =>
						option
							.setName("country")
							.setDescription("name of the country")
							.setRequired(true)
							.setChoices(this.choiceName())
					)
			)
			.addSubcommandGroup((option) =>
				option
					.setName("details")
					.setDescription("gives you specific infos for a country")
					.addSubcommand((option) =>
						option
							.setName("official-name")
							.setDescription("get a countries official name")
							.addStringOption((option) =>
								option
									.setName("country")
									.setDescription("name of the country")
									.setRequired(true)
									.setChoices(this.choiceName())
							)
					)
					.addSubcommand((option) =>
						option
							.setName("tld")
							.setDescription("get a countries top level domain")
							.addStringOption((option) =>
								option
									.setName("country")
									.setDescription("name of the country")
									.setRequired(true)
									.setChoices(this.choiceName())
							)
					)
					.addSubcommand((option) =>
						option
							.setName("population")
							.setDescription("get a countries population")
							.addStringOption((option) =>
								option
									.setName("country")
									.setDescription("name of the country")
									.setRequired(true)
									.setChoices(this.choiceName())
							)
					)
			);
	}

	async updateDataFromSource() {
		const url = "https://restcountries.com/v3.1/all";

		this.countryData = await fetch(url)
			.then((response) => response.json())
			.catch((err) => logger.debug(err))
			.then((res) => {
				return res as Country[];
			});

		fs.writeFile("./src/util/countryData.json", JSON.stringify(this.countryData), (err) => {
			if (err) throw err;
		});
	}

	sortedByPopulation(): Country[] {
		return this.countryData.sort((a, b) => b.population - a.population);
	}

	choiceName(): [name: string, value: string][] {
		return this.countryData.map((v) => [v.name.common, v.cca2]).slice(0, 25) as [name: string, value: string][];
	}

	getCountryWithCode(code: string): Country {
		return this.countryData.find((v) => v.cca2 === code) as Country;
	}
}

export default new CountryCommand();
