import { CommandInteraction } from "discord.js";
import { countryUndefinedReply } from "./generalCountryCommandUtil";
import { Country, getCountryByName } from "./countryDataManager";
import { formatNumber } from "util/numbers";


export function specificCommand(interaction: CommandInteraction) {
    const country: Country | undefined = getCountryByName(interaction.options.getString("country") ?? "Bhutan");

    const info: string = interaction.options.getString("info") ?? "population";

    if (country) {
        interaction.reply(specificRequestReplies[info](country, interaction.locale));
    } else {
        countryUndefinedReply(interaction);
    }
}


const specificRequestReplies: { [id: string]: (country: Country, locale: string) => string | object } = {
    official_name: (country) => `The official name of ${country.name} is: ${country.official_name}`,
    flag: (country) => {
        return { content: `${country.name}'s flag:`, files: [country.flags.png] };
    },
    map: (country) => `You can find ${country.name} on google maps here: ${country.maps.googleMaps}`,
    cca2: (country) => `The cca2 code of ${country.name} is ${country.cca2}`,
    tld: (country) => `The Top Level Domain of ${country.name} is ${country.tld}`,
    unMember: (country) => `${country.name} is${country.unMember ? " " : " not "} a member of the UN`,
    population: (country, locale) => `The population size of ${country.name} is: ${formatNumber(country.population, locale)}`,
    capital: (country) => `The capital of ${country.name} is ${country.capital}`,
    languages: (country) => `In ${country.name} these following languages are spoken: ${country.languages.join(", ")}`,
    currencies: (country) => `In ${country.name} these currencies are used: ${country.currencies.join(", ")}`,
    timezones: (country) => `${country.name} includes these timezones: ${country.timezones.join(", ")}`,
    region: (country) => `${country.name} is part of ${country.region}`,
    subregion: (country) => `${country.name} is part of ${country.subregion}`,
    latitude: (country) => `The latitude of ${country.name} is ${country.latitude}° N/S`,
    longitude: (country) => `The longitude of ${country.name} is ${country.longitude}° E/W`,
    area: (country, locale) => `The area of ${country.name} is: ${formatNumber(country.area, locale)} km²`,
};