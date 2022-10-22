import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { makeStats, getEntrys } from "./help";
import { addDefaultEmbedFooter } from "../misc/embeds";
import { activityTrackerLogDb } from "../../db";
import { deleteButtonAsRow } from "../misc/buttons";

export async function statisticsMystats(interaction: ChatInputCommandInteraction): Promise<void> {
	const game = interaction.options.getString("game")?.toLowerCase();
	const fields = await makeStats(await getEntrys(interaction.user.id, game));

	if (fields.length == 0) {
		let embed = new EmbedBuilder().setTitle(game === null ? "No logs found" : `No logs found for ${game}`);
		embed = addDefaultEmbedFooter(embed);
		await interaction.reply({ embeds: [embed] });
		return;
	}

	if (game === null) {
		const allEntrys = activityTrackerLogDb.keyArray();
		const games = allEntrys.filter((e) => e.split("-")[0] === interaction.user.id).length;

		let embed = new EmbedBuilder()
			.setTitle("Your stats across all games")
			.addFields(fields)
			.addFields({ name: "Games", value: `${games} unique games`, inline: true });
		embed = addDefaultEmbedFooter(embed);
		await interaction.reply({ embeds: [embed] });
		return;
	}

	let embed = new EmbedBuilder().setTitle(`Your stats about ${game}`).addFields(fields);
	embed = addDefaultEmbedFooter(embed);
	const row = deleteButtonAsRow(interaction.user.id, true);
	await interaction.reply({ embeds: [embed], components: [row] });
}

export async function statisticsGamestats(interaction: ChatInputCommandInteraction): Promise<void> {
	const game = interaction.options.getString("game", true).toLowerCase();
	const fields = await makeStats(await getEntrys(undefined, game));

	if (fields.length == 0) {
		let embed = new EmbedBuilder().setTitle(`No logs found for ${game}`);
		embed = addDefaultEmbedFooter(embed);
		await interaction.reply({ embeds: [embed] });
		return;
	}

	const allEntrys = activityTrackerLogDb.keyArray();
	const users: string[] = [];
	allEntrys.forEach((e) => {
		if (e.split("-")[1].toLowerCase() === game && !users.includes(e)) users.push(e);
	});

	if (users.length === 0) {
		let embed = new EmbedBuilder().setTitle("No records found");
		embed = addDefaultEmbedFooter(embed);
		await interaction.reply({ embeds: [embed] });
		return;
	}

	let embed = new EmbedBuilder()
		.setTitle(`Stats across all users for ${game}`)
		.addFields(fields)
		.addFields({ name: "Users", value: `${users.length} unique users`, inline: true });
	embed = addDefaultEmbedFooter(embed);
	await interaction.reply({ embeds: [embed] });
	return;
}

export async function statisticsAllstats(interaction: ChatInputCommandInteraction): Promise<void> {
	const fields = await makeStats(await getEntrys(undefined, undefined));

	if (fields.length == 0) {
		let embed = new EmbedBuilder().setTitle("No logs found");
		embed = addDefaultEmbedFooter(embed);
		await interaction.reply({ embeds: [embed] });
		return;
	}

	const allEntrys = activityTrackerLogDb.keyArray();
	const users: string[] = [];
	const games: string[] = [];
	allEntrys.forEach((e) => {
		const split = e.split("-");
		const user = split[0];
		const game = split[1];
		if (!users.includes(user)) users.push(user);
		if (!games.includes(game)) games.push(game);
	});

	let embed = new EmbedBuilder()
		.setTitle("Stats across all users and games")
		.addFields(fields)
		.addFields(
			{ name: "Users", value: `${users.length} unique users`, inline: true },
			{ name: "Games", value: `${games.length} unique games`, inline: true }
		);

	embed = addDefaultEmbedFooter(embed);
	await interaction.reply({ embeds: [embed] });
}
