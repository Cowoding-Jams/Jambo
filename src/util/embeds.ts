import { MessageEmbed } from "discord.js";
import { config } from "../config";

export function addDefaultEmbedFooter(embed: MessageEmbed): MessageEmbed {
	return embed
		.setAuthor({
			name: `Made by me, ${config.botName} :)`,
			iconURL: config.iconURL,
			url: config.githubURL,
		})
		.setColor(config.color)
		.setTimestamp();
}
