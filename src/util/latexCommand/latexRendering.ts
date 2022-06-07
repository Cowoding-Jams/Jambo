import fetch from "node-fetch";
import fs from "fs";

const pathToTemplate = "./src/util/latexCommand/template.tex";
const apiUrl = "http://rtex.probablyaweb.site/api/v2";

export async function latexMixed(input:string = "Welcome to \\LaTeX"): Promise<string|null> {
    let code = readTemplate();
    code = code.replace("#CONTENT", input.replaceAll("$", "$$$"));
    return await requestRendering(code);
}

export async function latexEquation(input: string = "\\pi = 3.14") {
    let code = readTemplate();
    code = code.replace("#CONTENT", "$$$" + input + "$$$");;
    return await requestRendering(code);
}

function readTemplate(): string {
    return fs.readFileSync(pathToTemplate, "utf8")
}

/* async function getImage(url: string, path: string) {
    fetch(url).then((res: any) =>
		res.body.pipe(fs.createWriteStream(path))
	)
} */

async function requestRendering(code: string): Promise<string|null> {
    let body = {
        'code': code,
        'format': 'png',
        'quality': 20,
        'density': 300
    };
    
    let response: any = await fetch(apiUrl, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' }
    }).then(res => res.json());

    if (response.filename == undefined) {
        return null;
    }

    return apiUrl + "/" + response.filename;
}