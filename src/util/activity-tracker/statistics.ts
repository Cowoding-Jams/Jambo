import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { getEntries, makeStats, splitId } from "./help";
import { addEmbedFooter } from "../misc/embeds";
import { activityTrackerLogDb } from "../../db";
import { durationToReadable } from "../misc/time";
import { Duration } from "luxon";

export async function statsMy(interaction: ChatInputCommandInteraction): Promise<void> {
	let game = interaction.options.getString("game")?.toLowerCase();

	const entries = getEntries(interaction.user.id, game);

	if (entries.length == 0) {
		await interaction.reply({
			content: "No logs found...",
			ephemeral: true,
		});
		return;
	}

	const fields = await makeStats(entries);

	if (game === null) {
		const games: string[] = [];
		entries.forEach((e) => {
			games.push(splitId(e).game);
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
	await interaction.reply({ embeds: [embed] });
}

export async function statsGame(interaction: ChatInputCommandInteraction): Promise<void> {
	const game = interaction.options.getString("game", true).toLowerCase();
	const showPlaytime = interaction.options.getBoolean("show-playtime") ?? false;

	const entrys = await getEntries(undefined, game);
	const fields = await makeStats(entrys);

	if (fields.length == 0) {
		let embed = new EmbedBuilder().setTitle(`No logs found for ${game}...`);
		embed = addEmbedFooter(embed);
		await interaction.reply({ embeds: [embed] });
		return;
	}

	const users: string[] = [];
	entrys.forEach((e) => {
		users.push(splitId(e).user);
	});
	if (users.length === 0) {
		await interaction.reply({ content: "No records found...", ephemeral: true });
		return;
	}

	let embed = new EmbedBuilder()
		.setTitle(`Stats across all users for ${game.replace(/(\b\w)/g, (e) => e.toUpperCase())}!`)
		.addFields(fields)
		.addFields({ name: "Users", value: `${users.length} unique gaymers :)`, inline: true });

	if (showPlaytime) {
		const entries = activityTrackerLogDb.filter((val, key) => splitId(key).game === game);
		let playtime = new Map<string, Duration>();
		users.forEach((u) => {
			playtime.set(
				u,
				Array.from(entries.filter((val, key) => splitId(key).user === u).values())
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

export async function statsAll(interaction: ChatInputCommandInteraction): Promise<void> {
	const entrys = getEntries();
	const fields = await makeStats(entrys);

	if (fields.length == 0) {
		await interaction.reply({ content: "No logs found...", ephemeral: true });
		return;
	}

	const users: string[] = [];
	const games: string[] = [];
	entrys.forEach((e) => {
		const { user, game } = splitId(e);
		if (!users.some((e) => e === user)) users.push(user);
		if (!games.some((e) => e === game)) games.push(game);
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
