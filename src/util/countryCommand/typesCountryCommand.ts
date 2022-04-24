export type MainCountryDataTypes = number | string | boolean | string[]; // without the maps and flags object

export type CountryKey = keyof Country;
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

export interface CountryImport {
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
