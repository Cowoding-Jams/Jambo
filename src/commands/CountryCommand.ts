import { Command } from "../Command";
import { CommandInteraction, MessageEmbed } from "discord.js";
import {
	inlineCode,
	SlashCommandBuilder,
	SlashCommandStringOption,
	SlashCommandSubcommandsOnlyBuilder,
} from "@discordjs/builders";
import { Country, getCountryWithCode } from "../util/countryUtil/dataManager";

class CountryCommand extends Command {
	constructor() {
		super("country");
	}

	async execute(interaction: CommandInteraction): Promise<void> {
		const countryCode: string | null = interaction.options.getString("country");
		let country: Country = getCountryWithCode("BT"); // default country

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
				interaction.reply({
					embeds: [getOverviewEmbed(country, interaction.locale)],
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
			.setDescription("accessing country data")
			.addSubcommand((option) =>
				option.setName("overview").setDescription("important infos").addStringOption(getCountryOption)
			)
			.addSubcommandGroup((option) =>
				option
					.setName("specific")
					.setDescription("specific infos")
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
			)
			.addSubcommand((option) =>
				option.setName("update-data").setDescription("updates the data from its online source")
			);
	}
}

export default new CountryCommand();

function getOverviewEmbed(country: Country, numberFormat: string): MessageEmbed {
	return new MessageEmbed()
		.setTitle(country.name.common)
		.setThumbnail(country.flags.png)
		.setDescription(`(officially: ${country.name.official}, code: ${country.cca2})`)
		.addFields(
			{
				name: "Demographics",
				value: `- Population size: ${country.population.toLocaleString(numberFormat)}
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
				 - Area: ${country.area.toLocaleString(numberFormat)} km²
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

function getCountryOption(option: SlashCommandStringOption) {
	return option.setName("country").setDescription("name of the country").setRequired(true).setAutocomplete(true);
}
