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
