import { ChatInputCommandInteraction, EmbedBuilder, inlineCode } from "discord.js";
import { addEmbedFooter } from "../misc/embeds.js";
import { formatNumber } from "../misc/numbers.js";
import { pickRandomFromList } from "../misc/random.js";
import { countryData } from "./countryDataLoader.js";
import { getCountryByName } from "./countryDataManager.js";
import { handleUndefinedCountry } from "./generalCountryCommandUtil.js";
import { Country } from "./typesCountryCommand.js";

export function overviewSubcommand(interaction: ChatInputCommandInteraction) {
	const country: Country | undefined = getCountryByName(interaction.options.getString("country", true));

	if (country) {
		interaction.reply({ embeds: [getOverviewEmbed(country, interaction.locale)] });
	} else {
		handleUndefinedCountry(interaction);
	}
}

export function randomOverviewSubcommand(interaction: ChatInputCommandInteraction) {
	interaction.reply({
		embeds: [getOverviewEmbed(pickRandomFromList(countryData), interaction.locale)],
	});
}

function getOverviewEmbed(country: Country, locale: string): EmbedBuilder {
	const embed = new EmbedBuilder()
		.setTitle(country.name)
		.setThumbnail(country.flags.png)
		.setDescription(`(officially: ${country.official_name}, code: ${country.cca2})`)
		.addFields(
			{
				name: "Demographics",
				value: `- Population size: ${formatNumber(country.population, locale)} (${
					countryData.indexOf(country) + 1
				}.)\n- Is${!country.unMember ? " not" : ""} a member of the UN\n- Top Level Domain: ${inlineCode(
					country.tld.join(" / ")
				)}\n- Currenc${country.currencies.length > 1 ? "ies" : "y"}: ${country.currencies.join(
					", "
				)}\n- Language(s): ${Object.values(country.languages).join(", ")}`,
			},
			{
				name: "Geographics",
				value: `- Capital: ${country.capital.join(", ")}\n- Region: ${country.region}, Subregion: ${
					country.subregion
				}\n- Coordinates: ${Math.round(country.latitude)}° N/S, ${Math.round(
					country.longitude
				)}° E/W\n- Timezone${country.timezones.length != 1 ? "" : "s"}: ${country.timezones.join(
					", "
				)}\n- Area: ${formatNumber(country.area, locale)} km²\n- [Google Maps](${country.maps.googleMaps})`,
			}
		);

	return addEmbedFooter(embed);
}
