import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { getEntrys, makeStats, splitId } from "./help";
import { addDefaultEmbedFooter } from "../misc/embeds";
import { deleteButtonAsRow } from "../misc/buttons";

export async function statisticsMyStats(interaction: ChatInputCommandInteraction): Promise<void> {
	let game = interaction.options.getString("game")?.toLowerCase();
	const entrys = await getEntrys(interaction.user.id, game);
	const fields = await makeStats(entrys);

	if (fields.length == 0) {
		let embed = new EmbedBuilder().setTitle(
			game === null
				? "No logs found!"
				: game == undefined
				? `Nothing has been loggged yet.`
				: `No logs found for ${game}...`
		);
		embed = addDefaultEmbedFooter(embed);
		await interaction.reply({ embeds: [embed] });
		return;
	}

	if (game === null) {
		const games: string[] = [];
		entrys.forEach((e) => {
			games.push(splitId(e)[1]);
		});

		let embed = new EmbedBuilder()
			.setTitle("Your stats across all games")
			.addFields(fields)
			.addFields({ name: "Games", value: `${games} unique games`, inline: true });
		embed = addDefaultEmbedFooter(embed);
		await interaction.reply({ embeds: [embed] });
		return;
	}

	if (game === undefined) {
		game = "every logged game";
	} else {
		game = game.replace(/(\b\w)/g, (e) => e.toUpperCase());
	}

	let embed = new EmbedBuilder().setTitle(`Your stats about ${game}`).addFields(fields);
	embed = addDefaultEmbedFooter(embed);
	const row = deleteButtonAsRow(interaction.user.id, true);
	await interaction.reply({ embeds: [embed], components: [row] });
}

export async function statisticsGameStats(interaction: ChatInputCommandInteraction): Promise<void> {
	const game = interaction.options.getString("game", true).toLowerCase();
	const entrys = await getEntrys(undefined, game);
	const fields = await makeStats(entrys);

	if (fields.length == 0) {
		let embed = new EmbedBuilder().setTitle(`No logs found for ${game}...`);
		embed = addDefaultEmbedFooter(embed);
		await interaction.reply({ embeds: [embed] });
		return;
	}

	const users: string[] = [];
	entrys.forEach((e) => {
		users.push(splitId(e)[0]);
	});
	if (users.length === 0) {
		let embed = new EmbedBuilder().setTitle("No records found!");
		embed = addDefaultEmbedFooter(embed);
		await interaction.reply({ embeds: [embed] });
		return;
	}

	let embed = new EmbedBuilder()
		.setTitle(`Stats across all users for ${game.replace(/(\b\w)/g, (e) => e.toUpperCase())}!`)
		.addFields(fields)
		.addFields({ name: "Users", value: `${users.length} unique gaymers :)`, inline: true });
	embed = addDefaultEmbedFooter(embed);
	await interaction.reply({ embeds: [embed] });
	return;
}

export async function statisticsAllStats(interaction: ChatInputCommandInteraction): Promise<void> {
	const entrys = await getEntrys(undefined, undefined);
	const fields = await makeStats(entrys);

	if (fields.length == 0) {
		let embed = new EmbedBuilder().setTitle("No logs found");
		embed = addDefaultEmbedFooter(embed);
		await interaction.reply({ embeds: [embed] });
		return;
	}

	const users: string[] = [];
	const games: string[] = [];
	entrys.forEach((e) => {
		const [userEntry, gameEntry] = splitId(e);
		if (!users.some((e) => e === userEntry)) users.push(userEntry);
		if (!games.some((e) => e === gameEntry)) games.push(gameEntry);
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
