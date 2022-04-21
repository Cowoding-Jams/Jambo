import fetch from "node-fetch";
import { logger } from "../logger";

export interface Country {
	name: string;
	official_name: string;
	cca2: string;
	tld: string[];
	unMember: boolean;
	population: number;
	capital: string[];
	languages: string[];
	currencies: string[];
	timezones: string[];
	region: string;
	subregion: string;
	latitude: number;
	longitude: number;
	area: number;
	maps: { googleMaps: string; openStreetMaps: string };
	flags: { png: string; svg: string };
}

export let countryData: Country[] = [];
export type CountryKey = keyof Country;

type MainCountryDataTypes = number | string | boolean | string[]; // without the maps and flags object

export function getCountryByName(name: string): Country | undefined {
	return countryData.find((c) => c.name === name);
}

export function getCountryByCriteriaAndValue(criteria: CountryKey, value: MainCountryDataTypes): Country | undefined {
	return countryData.find((c) => c[criteria] === value);
}

export function typeOfCountryProperty(criteria: CountryKey) {
	// type ValueOf<T> = T[keyof T];
	// const representative: ValueOf<Country> = countryData[0][criteria];
	return typeof countryData[0][criteria];
}

const extractData: { [id: string]: (c: CountryImport) => MainCountryDataTypes | undefined | object } = {
	name: (c) => c.name.common,
	official_name: (c) => c.name.official,
	cca2: (c) => c.cca2,
	tld: (c) => c.tld,
	unMember: (c) => c.unMember,
	population: (c) => c.population,
	capital: (c) => c.capital,
	languages: (c) => (c.languages ? Object.values(c.languages) : undefined),
	currencies: (c) => (c.currencies ? Object.values(c.currencies ?? { "-": "-" }).map((co) => co.name) : undefined),
	timezones: (c) => c.timezones,
	region: (c) => c.region,
	subregion: (c) => c.subregion,
	area: (c) => c.area,
	latitude: (c) => c.latlng[0],
	longitude: (c) => c.latlng[1],
	maps: (c) => c.maps,
	flags: (c) => c.flags,
};

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

// importing the data
export async function initializeCountryData() {
	const url = "https://restcountries.com/v3.1/all";

	logger.debug("Fetching the country data");

	countryData = countryDataImportToCountryData(
		await fetch(url)
			.then((response) => response.json())
			.catch((err) => logger.debug(err))
			.then((res) => {
				return res as CountryImport[];
			})
	).sort((a, b) => b.population - a.population);

	logger.debug("Initialized the country data");
}

function countryDataImportToCountryData(countryImport: CountryImport[]): Country[] {
	const countrydata: Country[] = [];

	countryImport.forEach((c) => {
		const newCountry: Country = { ...defaultCountryData };

		Object.entries(extractData).forEach(([key, entry]) => {
			const value = entry(c);
			if (value !== undefined) {
				(newCountry[key as CountryKey] as unknown) = value;
			}
		});

		countrydata.push(newCountry);
	});

	return countrydata;
	//return countryImport.map(c => Object.fromEntries(Object.entries(extractData).map(([k, v]) => [k, v(c) ?? defaultCountryData[k as CountryKey]])) as unknown as Country);
}

interface CountryImport {
	name: { common: string; official: string };
	cca2: string;
	tld: string[];
	unMember: boolean;
	population: number;
	capital: string[];
	languages: object;
	currencies: object;
	timezones: string[];
	region: string;
	subregion: string;
	latlng: number[];
	area: number;
	maps: { googleMaps: string; openStreetMaps: string };
	flags: { png: string; svg: string };
}

// sorting the data
export function sortCountryDataBy(criteria: CountryKey) {
	countryData.sort((a, b) =>
		sortingComparators[typeOfCountryProperty(criteria)](
			a[criteria] as MainCountryDataTypes,
			b[criteria] as MainCountryDataTypes
		)
	);
}

const sortingComparators: { [id: string]: (a: MainCountryDataTypes, b: MainCountryDataTypes) => number } = {
	number: (a, b) => (a as number) - (b as number),
	string: (a, b) => ((a as string).toLowerCase() <= (b as string).toLowerCase() ? -1 : 1),
	boolean: (a, b) => ((!a as boolean) && (b as boolean) ? -1 : 0),
	object: (a, b) =>
		sortingComparators["string"](
			(a as string[]).sort(sortingComparators["string"])[0] ?? "",
			(b as string[]).sort(sortingComparators["string"])[0] ?? ""
		),
};

// filtering the data
export function getFilteredCountryDataBy(
	criteria: CountryKey,
	relation: string,
	value: number | string | boolean
): Country[] {
	return countryData.filter((c) =>
		filteringComparators[typeOfCountryProperty(criteria)](c[criteria] as MainCountryDataTypes, relation, value)
	);
}

const filteringComparators: {
	[id: string]: (
		value: MainCountryDataTypes,
		relation: keyof typeof dataRelations,
		valueCom: number | string | boolean
	) => boolean;
} = {
	number: (a, rel, b) => dataRelations[rel](a as number, b as number),
	string: (a, rel, b) => dataRelations[rel]((a as string).toLowerCase(), (b as string).toLowerCase()),
	boolean: (a, rel, b) => dataRelations[rel](a as boolean, b as boolean),
	object: (a, rel, b) => (a as string[]).map((s) => filteringComparators["string"](s, rel, b)).some((e) => e),
};

const dataRelations: { [id: string]: (a: number | string | boolean, b: number | string | boolean) => boolean } = {
	eq: (a, b) => a === b,
	l: (a, b) => a < b,
	g: (a, b) => a > b,
	le: (a, b) => a <= b,
	ge: (a, b) => a >= b,
};
