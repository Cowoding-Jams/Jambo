import { CommandInteraction, MessageEmbed } from "discord.js";
import { inlineCode } from "@discordjs/builders";
import { getCountryByName } from "./countryDataManager";
import { Country } from "./typesCountryCommand";
import { handleUndefinedCountry } from "./generalCountryCommandUtil";
import { addDefaultEmbedFooter } from "../embeds";
import { formatNumber } from "../numbers";
import { pickRandomFromList } from "../random";
import { countryData } from "./countryDataLoader";

export function overviewSubcommand(interaction: CommandInteraction) {
	const country: Country | undefined = getCountryByName(interaction.options.getString("country") ?? "Bhutan");

	if (country) {
		interaction.reply({ embeds: [getOverviewEmbed(country, interaction.locale)] });
	} else {
		handleUndefinedCountry(interaction);
	}
}

export function randomOverviewSubcommand(interaction: CommandInteraction) {
	interaction.reply({ embeds: [getOverviewEmbed(pickRandomFromList(countryData), interaction.locale)] });
}

function getOverviewEmbed(country: Country, locale: string): MessageEmbed {
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
