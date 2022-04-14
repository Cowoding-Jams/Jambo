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

type nameAndCode = { name: string; value: string };

export let countryData: Country[] = (data as Country[]).sort((a, b) => b.population - a.population);
export let countryNameAndCode: nameAndCode[] = countryData.map(returnNameAndCode) as nameAndCode[];
export const countryChoices: [name: string, value: string][] = countryNameAndCode.map((c) => [c.name, c.value]) as [name: string, value: string][];

export function init() {
    /* if (fs.existsSync("./countryData.json")) {
            this.updateDataFromSource();
        } else {
        } */
}

export async function updateDataFromSource() {
    const url = "https://restcountries.com/v3.1/all";

    countryData = await fetch(url)
        .then((response) => response.json())
        .catch((err) => logger.debug(err))
        .then((res) => {
            return res as Country[];
        });

    fs.writeFile("./src/util/countryData.json", JSON.stringify(countryData), (err) => {
        if (err) throw err;
    });
}

export function getCountryWithCode(code: string): Country {
    return countryData.find((v) => v.cca2 === code) as Country;
}

function returnNameAndCode(c: Country): nameAndCode {
    return { name: c.name.common, value: c.cca2 }
}