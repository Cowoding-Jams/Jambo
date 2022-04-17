import fetch from "node-fetch";
import { logger } from "../../logger";
import data from "./countryData.json";
import fs from "fs";
import { formatNumber } from "../../commands/CountryCommand";

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

export type nameAndValue = { name: string; value: string | string[] };

export let countryData: Country[] = (data as Country[]).sort((a, b) => b.population - a.population);

// sorts the array in place and returns it
export const sortCountryData: { [id: string]: () => {} } = {
	population: () => countryData.sort((a, b) => a.population - b.population),
	area: () => countryData.sort((a, b) => a.area - b.area),
	latitude: () => countryData.sort((a, b) => b.latlng[0] - a.latlng[0]),
	longitude: () => countryData.sort((a, b) => b.latlng[1] - a.latlng[1])
};

export const relations: { [id: string]: (a: number | string, b: number | string) => boolean } = {
	eq: (a, b) => (a === b),
	l: (a, b) => (a < b),
	g: (a, b) => (a > b),
	le: (a, b) => (a <= b),
	ge: (a, b) => (a >= b),
}

// returns array
export const filterCountryDataWithValue: { [id: string]: (relation: string, value: string) => Country[] } = {
	currency: (value) => countryData.filter((c) => value in Object.values(c.currencies).map((co) => co.name)),
	language: (value) => countryData.filter((c) => value in Object.values(c.languages)),
	region: (value) => countryData.filter((c) => value === c.region),
	subregion: (value) => countryData.filter((c) => value === c.subregion),
	timezone: (value) => countryData.filter((c) => value in c.timezones)
};

export const reduceCountryData: { [id: string]: () => string[][] } = {
	population: () => countryData.map((c) => [c.name.common, formatNumber(c.population)]),
	area: () => countryData.map((c) => [c.name.common, formatNumber(c.area)]),
	latitude: () => countryData.map((c) => [c.name.common, formatNumber(c.latlng[0])]),
	longitude: () => countryData.map((c) => [c.name.common, formatNumber(c.latlng[1])]),
	currency: () => countryData.map((c) => [c.name.common].concat(Object.values(c.currencies).map((co) => co.name))),
	language: () => countryData.map((c) => [c.name.common].concat(Object.values(c.languages))),
	region: () => countryData.map((c) => [c.name.common, c.region]),
	subregion: () => countryData.map((c) => [c.name.common, c.subregion]),
	timezone: () => countryData.map((c) => [c.name.common].concat(c.timezones)),
};


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

