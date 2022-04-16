import fetch from "node-fetch";
import { logger } from "../../logger";
import data from "./countryData.json";
import fs from "fs";

export interface Country {
	name: { common: string; official: string };
	cca2: string;
	tld: string[];
	population: number;
	capital: string[];
	currencies: object;
	languages: object;
	unMember: boolean;
	latlng: number[];
	region: string;
	subregion: string;
	area: number;
	maps: { googleMaps: string; openStreetMaps: string };
	timezones: string[];
	flags: { png: string; svg: string };
}

export let countryData: Country[] = (data as Country[]).sort((a, b) => b.population - a.population);

export async function updateDataFromSource() {
	const url = "https://restcountries.com/v3.1/all";

	logger.debug(`Updating the country data from: ${url}`);

	countryData = await fetch(url)
		.then((response) => response.json())
		.catch((err) => logger.debug(err))
		.then((res) => {
			return res as Country[];
		});

	fs.writeFile("./src/util/countryUtil/countryData.json", JSON.stringify(countryData), (err) => {
		if (err) throw err;
	});

	logger.debug("Updated the country data");
}

export function getCountryWithItsCCA2(code: string): Country | undefined {
	return countryData.find((v) => v.cca2 === code) as Country;
}

