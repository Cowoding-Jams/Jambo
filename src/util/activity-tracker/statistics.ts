import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { getEntrys, makeStats, splitId } from "./help";
import { addEmbedFooter } from "../misc/embeds";
import { deleteButtonAsRow } from "../misc/buttons";
import { activityTrackerLogDb } from "../../db";
import { durationToReadable } from "../misc/time";
import { Duration } from "luxon";

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
		embed = addEmbedFooter(embed);
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
		embed = addEmbedFooter(embed);
		await interaction.reply({ embeds: [embed] });
		return;
	}

	if (game === undefined) {
		game = "every logged game";
	} else {
		game = game.replace(/(\b\w)/g, (e) => e.toUpperCase());
	}

	let embed = new EmbedBuilder().setTitle(`Your stats about ${game}`).addFields(fields);
	embed = addEmbedFooter(embed);
	const row = deleteButtonAsRow(interaction.user.id, true);
	await interaction.reply({ embeds: [embed], components: [row] });
}

export async function statisticsGameStats(interaction: ChatInputCommandInteraction): Promise<void> {
	const game = interaction.options.getString("game", true).toLowerCase();
	const showPlaytime = interaction.options.getBoolean("show-playtime") ?? false;

	const entrys = await getEntrys(undefined, game);
	const fields = await makeStats(entrys);

	if (fields.length == 0) {
		let embed = new EmbedBuilder().setTitle(`No logs found for ${game}...`);
		embed = addEmbedFooter(embed);
		await interaction.reply({ embeds: [embed] });
		return;
	}

	const users: string[] = [];
	entrys.forEach((e) => {
		users.push(splitId(e)[0]);
	});
	if (users.length === 0) {
		let embed = new EmbedBuilder().setTitle("No records found!");
		embed = addEmbedFooter(embed);
		await interaction.reply({ embeds: [embed] });
		return;
	}

	let embed = new EmbedBuilder()
		.setTitle(`Stats across all users for ${game.replace(/(\b\w)/g, (e) => e.toUpperCase())}!`)
		.addFields(fields)
		.addFields({ name: "Users", value: `${users.length} unique gaymers :)`, inline: true });

	if (showPlaytime) {
		const entries = activityTrackerLogDb.filter((val, key) => splitId(key)[1] === game);
		let playtime = new Map<string, Duration>();
		users.forEach((u) => {
			playtime.set(
				u,
				Array.from(entries.filter((val, key) => splitId(key)[0] === u).values())
					.flat()
					.reduce((a, b) => a.plus(b.duration), Duration.fromObject({ seconds: 0 }))
			);
		});

		playtime = new Map(
			Array.from(playtime.entries())
				.filter((u) => u[1])
				.sort((a, b) => (a[1] > b[1] ? -1 : 1))
				.slice(0, 10)
		);

		embed.addFields({
			name: "Playtime top 10",
			value: Array.from(playtime.entries())
				.map((e) => `${durationToReadable(e[1], true)} ⁘ <@${e[0]}>`)
				.join("\n"),
		});
	}

	embed = addEmbedFooter(embed);
	await interaction.reply({ embeds: [embed] });
	return;
}

export async function statisticsAllStats(interaction: ChatInputCommandInteraction): Promise<void> {
	const entrys = await getEntrys(undefined, undefined);
	const fields = await makeStats(entrys);

	if (fields.length == 0) {
		let embed = new EmbedBuilder().setTitle("No logs found");
		embed = addEmbedFooter(embed);
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

	embed = addEmbedFooter(embed);
	await interaction.reply({ embeds: [embed] });
}
