import fetch from "node-fetch";
import fs from "fs";
import { logger } from "../../logger";

const pathToTemplate = "./src/util/latexCommand/template.tex";
const apiUrl = "http://rtex.probablyaweb.site/api/v2";
const templateCode = fs.readFileSync(pathToTemplate, "utf8");

export async function latexMixed(input = "Welcome to \\LaTeX", transparent: boolean): Promise<string | null> {
	const code = templateCode.replace("#CONTENT", input.replaceAll("$", "$$$")).replaceAll("%MIXED", "");
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

	logger.debug(code);

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
	}).then((res) => res.json())) as res;

	if (response.filename == undefined) {
		logger.debug("Error rendering: " + response.description);
		return null;
	}

	logger.debug("LaTeX: " + apiUrl + "/" + response.filename);
	return apiUrl + "/" + response.filename;
}

/* async function getImage(url: string, path: string) {
    fetch(url).then((res: any) =>
		res.body.pipe(fs.createWriteStream(path))
	)
} */

// 1 bright 0 dark
/* 
Equation transparent:

mixed transparent:


Equation with background:
- boxed
- boxcolor 0.95


mixed with background:

*/

// 1 bright 0 dark
/* 
Equation transparent:
- no frame, no box
- no pagecolor
- fontcolor 0.9

mixed transparent:
- frame
- framecolor 0.1
- no pagecolor
- fontcolor 0.9

Equation with background:
- boxed
- boxcolor 0.95
- fontcolor 0
- pagecolor 1

mixed with background:
- frame
- framecolor 0.95 //bright
- fontcolor 0
- pagecolor 1
*/
