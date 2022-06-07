import fetch from "node-fetch";
import fs from "fs";
import { logger } from "../../logger";

const pathToTemplate = "./src/util/latexCommand/template.tex";
const apiUrl = "http://rtex.probablyaweb.site/api/v2";

export async function latexMixed(input = "Welcome to \\LaTeX"): Promise<string | null> {
	let code = readTemplate();
	code = code.replace("#CONTENT", input.replaceAll("$", "$$$"));
	return await requestRendering(code);
}

export async function latexEquation(input = "\\pi = 3.14") {
	let code = readTemplate();
	code = code.replace("#CONTENT", "$$$" + input + "$$$");
	return await requestRendering(code);
}

function readTemplate(): string {
	return fs.readFileSync(pathToTemplate, "utf8");
}

async function requestRendering(code: string): Promise<string | null> {
	const body = {
		code: code,
		format: "png",
		quality: 85,
		density: 200,
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
