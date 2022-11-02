import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

export function deleteButtonAsRow(userid: string, emoji: boolean): ActionRowBuilder<ButtonBuilder> {
	return new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder()
			.setCustomId(`delete.${userid}`)
			.setLabel(emoji ? "🗑️" : "Delete")
			.setStyle(ButtonStyle.Danger)
	);
}
export function deleteButtonAsComponent(userid: string, emoji: boolean): ButtonBuilder {
	return new ButtonBuilder()
		.setCustomId(`delete.${userid}`)
		.setLabel(emoji ? "🗑️" : "Delete")
		.setStyle(ButtonStyle.Danger);
}
