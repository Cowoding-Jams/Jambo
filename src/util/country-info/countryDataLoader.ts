import fetch from "node-fetch";
import { logger } from "../../logger";
import { Country, CountryImport, CountryKey, MainCountryDataTypes } from "./typesCountryCommand";

export let countryData: Country[] = [];

export async function initializeCountryData() {
	const url = "https://restcountries.com/v3.1/all";

	logger.debug("Fetching the country data...");

	const response = await fetch(url)
		.catch((err) => {
			throw err;
		})
		.then((res) =>
			res
				.json()
				.catch(() => {
					logger.error("Couldn't parse the country data. The api is probably down...");
					return;
				})
				.then((res) => {
					return res as CountryImport[];
				})
		);

	if (!response) {
		return;
	}

	countryData = countryDataImportToCountryData(response).sort((a, b) => b.population - a.population);

	logger.debug("Initialized the country data.");
}

function countryDataImportToCountryData(countryImport: CountryImport[]): Country[] {
	return countryImport.map((ci) => {
		const newCountry: Country = { ...defaultCountryData };

		Object.entries(extractData).forEach(([key, entry]) => {
			const value = entry(ci);
			if (value !== undefined) {
				(newCountry[key as CountryKey] as unknown) = value;
			}
		});

		return newCountry;
	});
}

const defaultCountryData: Country = {
	name: "unknown-name",
	official_name: "unkown-official-name",
	cca2: "unknown-cca2",
	tld: ["-"],
	unMember: false,
	population: 0,
	capital: ["-"],
	languages: ["-"],
	currencies: ["-"],
	timezones: ["-"],
	region: "unknown-region",
	subregion: "unknown-subregion",
	latitude: 0,
	longitude: 0,
	area: 0,
	maps: { googleMaps: "", openStreetMaps: "" },
	flags: { png: "", svg: "" },
};

const extractData: {
	[id: string]: (c: CountryImport) => MainCountryDataTypes | object | undefined;
} = {
	name: (c) => c.name.common,
	official_name: (c) => c.name.official,
	cca2: (c) => c.cca2,
	tld: (c) => c.tld,
	unMember: (c) => c.unMember,
	population: (c) => c.population,
	capital: (c) => c.capital,
	languages: (c) => (c.languages ? Object.values(c.languages) : undefined),
	currencies: (c) =>
		c.currencies ? Object.values(c.currencies ?? { "-": "-" }).map((co) => co.name) : undefined,
	timezones: (c) => c.timezones,
	region: (c) => c.region,
	subregion: (c) => c.subregion,
	area: (c) => c.area,
	latitude: (c) => c.latlng[0],
	longitude: (c) => c.latlng[1],
	maps: (c) => c.maps,
	flags: (c) => c.flags,
};
