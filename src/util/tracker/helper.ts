import { EmbedBuilder, InteractionReplyOptions } from "discord.js";
import { Duration } from "luxon";
import { trackerUsers } from "../../db";
import { durationToReadable } from "../misc/time";

export function makeTimeString(timeMS: number) {
	return durationToReadable(Duration.fromMillis(timeMS), true);
}
export function sortGamesPlaytime(userId: string) {
	const data = trackerUsers.get(userId);
	return data?.games.sort((a, b) => b.playtime - a.playtime);
}
export function sortGamesLogs(userId: string) {
	const data = trackerUsers.get(userId);
	return data?.games.sort((a, b) => b.logs - a.logs);
}
export function errorEmbed(title: string, info: string): InteractionReplyOptions {
	return {
		embeds: [
			new EmbedBuilder()
				.setTitle(`ERROR: ${title}`)
				.setDescription(`further info:\n\`\`\`${info}\`\`\``)
				.setColor([255, 0, 0]),
		],
		ephemeral: true,
	};
}
export function confirmEmbed(title: string): InteractionReplyOptions {
	return {
		embeds: [new EmbedBuilder().setTitle(title).setColor([255, 0, 0])],
		ephemeral: true,
	};
}
