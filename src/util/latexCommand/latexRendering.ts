import fetch from "node-fetch";
import fs from "fs";
import { logger } from "../../logger";

const pathToTemplate = "./src/util/latexCommand/template.tex";
const apiUrl = "http://rtex.probablyaweb.site/api/v2";
const templateCode = fs.readFileSync(pathToTemplate, "utf8");

export async function latexMixed(
	input = "Welcome to \\LaTeX",
	transparent: boolean,
	paper: string
): Promise<string | null> {
	const code = templateCode
		.replace("#CONTENT", input.replaceAll("$", "$$$"))
		.replaceAll("%MIXED", "")
		.replace("a5", paper);
	return await requestRendering(code, transparent);
}

export async function latexEquation(input = "\\pi = 3.14", transparent: boolean): Promise<string | null> {
	const code = templateCode.replace(
		"#CONTENT",
		transparent ? `$$$ ${input} $$$` : `$$$\\color{frameColorBright}\\boxed{\\color{black} ${input} }$$$`
	);
	return await requestRendering(code, transparent);
}

async function requestRendering(code: string, transparent: boolean): Promise<string | null> {
	code = transparent ? code.replaceAll("%TRANSPARENT", "") : code.replaceAll("%BACKGROUND", "");

	const body = {
		code: code,
		format: "png",
		quality: 100,
		density: 250,
	};

	type res = { filename: string; description: string };

	const response: res = (await fetch(apiUrl, {
		method: "POST",
		body: JSON.stringify(body),
		headers: { "Content-Type": "application/json" },
	}).then((res) => res.json().catch(() => undefined))) as res;

	if (response === undefined) {
		logger.error("There is a problem with the LaTeX API");
		return null;
	}

	if (response.filename == undefined) {
		logger.debug("Error rendering: " + response.description);
		return "";
	}

	return apiUrl + "/" + response.filename;
}
