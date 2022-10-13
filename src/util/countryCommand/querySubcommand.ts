import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { addDefaultEmbedFooter } from "../embeds";
import { formatNumber } from "../numbers";
import { shuffleList } from "../random";
import { countryData } from "./countryDataLoader";
import { getFilteredCountryDataBy, sortCountryDataBy, typeOfCountryProperty } from "./countryDataManager";
import { Country, CountryKey } from "./typesCountryCommand";

export function querySubcommand(interaction: ChatInputCommandInteraction) {
	const sortCriteria: CountryKey = (interaction.options.getString("sort-criteria") ?? "none") as CountryKey;
	const order = interaction.options.getString("order") ?? "ascending";
	const scale = interaction.options.getInteger("scale") ?? 10;
	const filterCriteria: CountryKey = (interaction.options.getString("filter-criteria") ??
		"none") as CountryKey;
	const relation = interaction.options.getString("relation") ?? "eq";
	let filterValue: string | boolean | number = interaction.options.getString("filter-value") ?? "";
	let includeData = interaction.options.getBoolean("include-data") ?? true;
	let numbered = false;
	let embedDataCriteria: CountryKey = sortCriteria;

	// sorting
	if ((sortCriteria as string) !== "none") {
		numbered = true;
		sortCountryDataBy(sortCriteria);
		if (order === "descending") {
			countryData.reverse();
		}
	} else {
		shuffleList(countryData);
		includeData = false;
	}

	// filtering
	let data: Country[] = countryData;
	if ((filterCriteria as string) !== "none") {
		if (["true", "false"].includes(filterValue)) {
			filterValue = Boolean(filterValue);
		} else if (!isNaN(+filterValue)) {
			filterValue = +filterValue;
		}

		if (
			typeof filterValue !== typeOfCountryProperty(filterCriteria) &&
			!(typeof filterValue === "string" && typeOfCountryProperty(filterCriteria) === "object")
		) {
			filterValueTypeDoesNotMatchCriteriaType(interaction);
			return;
		}

		includeData = true;
		data = getFilteredCountryDataBy(filterCriteria, relation, filterValue);

		if (relation !== "eq") {
			embedDataCriteria = filterCriteria;
		}
	}

	// output
	const titleStart = scale > countryData.length ? "All" : `Top ${scale}`;
	const titleSort =
		(sortCriteria as string) !== "none" ? `listed by ${sortCriteria} in ${order} order` : "shuffeled";
	const titleFilter =
		(filterCriteria as string) !== "none"
			? `, ${filteringTitles[relation](String(filterValue), filterCriteria)}`
			: "";
	const title = `${titleStart} countries ${titleSort}${titleFilter}`;
	interaction.reply({
		embeds: [
			getListEmbed(
				countriesToEmbedForm(data.slice(0, scale), embedDataCriteria, interaction.locale, includeData),
				title,
				numbered
			),
		],
	});
}

function filterValueTypeDoesNotMatchCriteriaType(interaction: ChatInputCommandInteraction) {
	interaction.reply({
		content:
			"Now I don't want to call you dumb infront of everyone but that just makes no sense...\nThat filter value just doesn't match the type of the criteria you wanted to filter by.",
		ephemeral: true,
	});
}

function getListEmbed(data: string[][], title: string, numbered: boolean): EmbedBuilder {
	let des: string;
	const dataSymbol: string = (data[0].length ?? 0) > 1 ? " ⁘ " : " ";
	if (numbered) {
		des = data.map((c, index) => `${index + 1}. ${c[0]}${dataSymbol}${c.slice(1).join(", ")}`).join("\n");
	} else {
		des = data.map((c) => `- ${c[0]}${dataSymbol}${c.slice(1).join(", ")}`).join("\n");
	}

	return addDefaultEmbedFooter(new EmbedBuilder().setTitle(title).setDescription(des));
}

const filteringTitles: { [id: string]: (value: string, criteria: CountryKey) => string } = {
	eq: (v, c) => `where its ${c} ${typeOfCountryProperty(c) === "object" ? "include" : "is"} ${v}`,
	l: (v, c) =>
		`where its ${c} ${filterTitleIncludePart(c)}${
			typeOfCountryProperty(c) === "string" ? " alphabetically" : ""
		} less then ${v}`,
	g: (v, c) =>
		`where its ${c} ${filterTitleIncludePart(c)}${
			typeOfCountryProperty(c) === "string" ? " alphabetically" : ""
		} greater then ${v}`,
	le: (v, c) =>
		`where its ${c} ${filterTitleIncludePart(c)}${
			typeOfCountryProperty(c) === "string" ? " alphabetically" : ""
		} less then or equal to ${v}`,
	ge: (v, c) =>
		`where its ${c} ${filterTitleIncludePart(c)}${
			typeOfCountryProperty(c) === "string" ? " alphabetically" : ""
		} greater then or equal to ${v}`,
};

const filterTitleIncludePart = (c: CountryKey) =>
	typeOfCountryProperty(c) === "object" ? "include a value which is alphabetically" : "is";

function countriesToEmbedForm(
	countries: Country[],
	criteria: CountryKey,
	locale: string,
	includeData: boolean
): string[][] {
	if (!includeData) {
		return countries.map((c) => [c.name]);
	}

	if (typeOfCountryProperty(criteria) === "number") {
		return countries.map((c) => [c.name, formatNumber(c[criteria] as number, locale)]);
	} else if (typeOfCountryProperty(criteria) === "boolean") {
		return countries.map((c) => [c.name, String(c[criteria])]);
	} else {
		return countries.map((c) => [c.name].concat(c[criteria] as ConcatArray<string>));
	}
}
