import { ChatInputCommandInteraction } from "discord.js";
import { birthdayDb } from "../../db";

export async function myCommand(interaction: ChatInputCommandInteraction) {
	if (!birthdayDb.has(interaction.user.id)) {
		await interaction.editReply({
			content: "You haven't set your birthday yet!\nYou can do this by using `/birthday set`",
		});
		return;
	}

	const entry = birthdayDb.get(interaction.user.id);
	const month = entry?.month;
	const day = entry?.day;

	await interaction.editReply({ content: `Your Birthday is set for the \`${day}.${month}\`` });
}
