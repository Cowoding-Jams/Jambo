import fetch from "node-fetch";
import fs from "fs";
import { logger } from "../../logger";

const pathToTemplate = "./src/util/latexCommand/template.tex";
const apiUrl = "http://rtex.probablyaweb.site/api/v2";
const templateCode = fs.readFileSync(pathToTemplate, "utf8");

export async function latexMixed(input = "Welcome to \\LaTeX", transparent: boolean): Promise<string | null> {
	const code = templateCode.replace("#CONTENT", input.replaceAll("$", "$$$"));
	return await requestRendering(code, transparent);
}

export async function latexEquation(input = "\\pi = 3.14", transparent: boolean) {
	const code = templateCode.replace("#CONTENT", "$$$" + input + "$$$");
	return await requestRendering(code, transparent);
}

async function requestRendering(code: string, transparent: boolean): Promise<string | null> {
	code = code.replace("#GRAYSCALE", transparent ? "0.9" : "0");

	const body = {
		code: transparent ? code : code.replace("%BACKGROUND", ""),
		format: "png",
		quality: 100,
		density: 250,
	};

	type res = { filename: string; description: string };

	const response: res = (await fetch(apiUrl, {
		method: "POST",
		body: JSON.stringify(body),
		headers: { "Content-Type": "application/json" },
	}).then((res) => res.json())) as res;

	if (response.filename == undefined) {
		logger.debug("Error rendering: " + response.description);
		return null;
	}

	return apiUrl + "/" + response.filename;
}

/* async function getImage(url: string, path: string) {
    fetch(url).then((res: any) =>
		res.body.pipe(fs.createWriteStream(path))
	)
} */
