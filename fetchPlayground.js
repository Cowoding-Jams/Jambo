import fetch from "node-fetch";
import * as fs from 'fs';


const content = "My favourite formula: $f(x)=x^2 \\bbR \\calA$"

let data = fs.readFileSync('./src/util/latexCommand/template.tex','utf8');

data = data.replace("CONTENT", content)

console.log(data)

let payload = {
    code: data,
    format: "png",
    quality: 85,
    density: 300,
};

const response = fetch("http://rtex.probablyaweb.site/api/v2", {
		method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
	}).then((res) => res.json())
    .then((data) => console.log(data))
    .catch((e) => console.log(e));
