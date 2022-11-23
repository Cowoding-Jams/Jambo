import { EmbedBuilder } from "discord.js";
import { config } from "../../config";

export function addEmbedFooter(embed: EmbedBuilder): EmbedBuilder {
	return embed.setColor(config.color).setAuthor({
		name: `Made by me, ${config.botName} :)`,
		iconURL: config.iconURL,
		url: config.githubURL,
	});
}

export function addEmbedColor(embed: EmbedBuilder): EmbedBuilder {
	return embed.setColor(config.color);
}

export function countEmbedCharacters(embed: EmbedBuilder): number {
	return [
		embed.data.title,
		embed.data.description,
		embed.data.fields?.map((f) => [f.name, f.value]) ?? [],
		embed.data.footer?.text,
		embed.data.author?.name,
	]
		.flat(2)
		.reduce((p, c) => {
			if (typeof c === "string") return p + c.length;
			return p;
		}, 0);
}
