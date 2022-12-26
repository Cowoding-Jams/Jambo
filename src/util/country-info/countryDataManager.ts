import { countryData } from "./countryDataLoader";
import { Country, CountryKey, MainCountryDataTypes } from "./typesCountryCommand";

export function getCountryByName(name: string): Country | undefined {
	return countryData.find((c) => c.name === name);
}

export function getCountryByCriteriaAndValue(
	criteria: CountryKey,
	value: MainCountryDataTypes
): Country | undefined {
	return countryData.find((c) => c[criteria] === value);
}

export function typeOfCountryProperty(criteria: CountryKey) {
	return typeof countryData[0][criteria];
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

const sortingComparators: {
	[id: string]: (a: MainCountryDataTypes, b: MainCountryDataTypes) => number;
} = {
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
		filteringComparators[typeOfCountryProperty(criteria)](
			c[criteria] as MainCountryDataTypes,
			relation,
			value
		)
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

const dataRelations: {
	[id: string]: (a: number | string | boolean, b: number | string | boolean) => boolean;
} = {
	eq: (a, b) => a === b,
	l: (a, b) => a < b,
	g: (a, b) => a > b,
	le: (a, b) => a <= b,
	ge: (a, b) => a >= b,
};
