import { Command } from "../Command";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { inlineCode, SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from "@discordjs/builders";
import { Country, countryChoices, getCountryWithCode } from "../util/countryUtil/dataManager";

class CountryCommand extends Command {
	choices: [name: string, value: string][];

	constructor() {
		super("country");
		this.choices = countryChoices.slice(0, 25);
	}

	async execute(interaction: CommandInteraction): Promise<void> {
		const countryCode: string = interaction.options.getString("country") || "UY";
		const country: Country = getCountryWithCode(countryCode);
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
																		.join(", ")}
								 - Language(s): ${Object.values(country.languages)}`,
						},
						{
							name: "Geographics",
							value: `- Capital: ${country.capital.join(", ")}
								 - Region: ${country.region}, Subregion: ${country.subregion}
                                 - Coordinates: ${Math.round(country.latlng[0])}° N/S, ${Math.round(
								country.latlng[1]
							)}° E/W
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
			.setName("country")
			.setDescription("lets you access country specific data")
			.addSubcommand((option) =>
				option
					.setName("overview")
					.setDescription("gives you an overview")
					.addStringOption((option) =>
						option.setName("country").setDescription("name of the country").setRequired(true).setChoices(this.choices)
					)
			)
			.addSubcommandGroup((option) =>
				option
					.setName("details")
					.setDescription("gives you a specific info about a country")
					.addSubcommand((option) =>
						option
							.setName("official-name")
							.setDescription("get a countries official name")
							.addStringOption((option) =>
								option.setName("country").setDescription("name of the country").setRequired(true).setAutocomplete(true)
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
									.setChoices(this.choices)
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
									.setChoices(this.choices)
							)
					)
			);
	}
}

export default new CountryCommand();
