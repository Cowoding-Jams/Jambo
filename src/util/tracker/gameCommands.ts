import { APIEmbedField, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { config } from "../../config";
import { trackerGames, trackerLogs, TrackerSublog } from "../../db";
import { addEmbedFooter } from "../misc/embeds";
import {
	dayInMillis,
	discordLongDateWithShortTimeTimestamp,
	discordTimestamp,
	monthInMillis,
	weekInMillis,
} from "../misc/time";
import { makeTimeString, sortDbToString } from "./helper";
import { gameNoEntry } from "./messages";

export async function gameStats(interaction: ChatInputCommandInteraction) {
	// get game option
	const targetGame = interaction.options.getString("game", true);

	// load tracker Games db
	const db = trackerGames.get(targetGame.toLocaleLowerCase());
	if (!db) {
		await interaction.reply(gameNoEntry);
		return;
	}

	// get top 5 played games and make a string
	const mostPlayed = sortDbToString<TrackerSublog>(
		db.users,
		(a, b) => b.playtime - a.playtime,
		(user) => `<@${user.name}>: ${makeTimeString(user.playtime)}`
	);

	// get top 5 logged games and make a string
	const mostLogged = sortDbToString<TrackerSublog>(
		db.users,
		(a, b) => b.logs - a.logs,
		(user) => `<@${user.name}>: ${user.logs} logs`
	);

	// format latest logs into a string
	const latestLogs = db.lastlogs
		.map((log) => `${discordLongDateWithShortTimeTimestamp(log.date)} <@${trackerLogs.get(log.id)?.userID}>`)
		.join("\n");
	// get total playtime, logs and users
	const totalPlaytime = db.playtime;
	const totalLogs = db.logs;
	const users = db.users.length;
	// get first log of game
	const firstSeen = db.firstlog.date;
	// calculate the range from first log to now
	const range = Date.now() - firstSeen;
	// calculate daily/weekly/monthly and per-log average playtime
	const playtimePer = `day: ${makeTimeString(
		Math.round(totalPlaytime / (range / dayInMillis))
	)}\nweek: ${makeTimeString(Math.round(totalPlaytime / (range / weekInMillis)))}\nmonth: ${makeTimeString(
		Math.round(totalPlaytime / (range / monthInMillis))
	)}\nuser: ${makeTimeString(Math.round(totalPlaytime / users))}\nlog: ${makeTimeString(
		Math.round(totalPlaytime / totalLogs)
	)}`;
	// temporary sorted list of most playtime/log (users)
	const tmp = db.users.sort((a, b) => b.playtime / b.logs - a.playtime / a.logs)[0];
	// make most playtime/log string
	const mostPlaytime = `<@${tmp.name}>: ${makeTimeString(tmp.playtime / tmp.logs)} - ${
		tmp.logs
	} logs\nTotal playtime: ${makeTimeString(tmp.playtime)}`;

	const embed = new EmbedBuilder()
		.setColor(config.color)
		.setTitle(`Tracking stats about ${targetGame}`)
		.addFields(
			{ inline: true, name: "Most playtime", value: mostPlayed },
			{ inline: true, name: "Most logs", value: mostLogged },
			{ inline: false, name: "_ _", value: "_ _" },
			{
				inline: true,
				name: "Total...",
				value: "Playtime: " + makeTimeString(totalPlaytime) + "\nlogs: " + totalLogs.toString(),
			},
			{ inline: false, name: "_ _", value: "_ _" },
			{ inline: true, name: "(Average) playtime per", value: playtimePer },
			{ inline: true, name: "(Average) playtime/log", value: mostPlaytime },
			{ inline: false, name: "_ _", value: "_ _" },
			{
				inline: true,
				name: "Record range",
				value: `${discordTimestamp(Math.floor(firstSeen))} -> ${discordTimestamp(
					Math.floor(Date.now() / 1000)
				)}(now)\n${makeTimeString(Math.floor(Date.now()/1000 - firstSeen))}`,
			},
			{ inline: false, name: "_ _", value: "_ _" },
			{ inline: true, name: "Latest logs", value: latestLogs }
		);

	await interaction.reply({ embeds: [addEmbedFooter(embed)] });
}
export async function gameLast(interaction: ChatInputCommandInteraction) {
	// get the target game
	const targetGame = interaction.options.getString("game", true);
	// load games db
	const db = trackerGames.get(targetGame);
	if (!db) {
		await interaction.reply(gameNoEntry);
		return;
	}

	// get latest logs
	const logs = db.lastlogs.reverse();
	// store future embed fields
	const fields: APIEmbedField[] = [];

	// make embed field for every log
	await logs.forEach(async (log) => {
		// get and validate log (db.lastlogs is a list of numbers as strings, not the actual log)
		if (!log) return;
		// get user who owns the log
		const user = await interaction.client.users.fetch(log.userID);
		// skip if user doesnt exist anymore
		if (!user) return;

		// make field
		fields.push({
			inline: true,
			name: user.username,
			value: `${discordLongDateWithShortTimeTimestamp(log.date)}\n${makeTimeString(log.playtime)}`,
		});
	});

	// add a last field so embed looks better formatted
	fields.push({ inline: true, name: "_ _", value: "_ _" });

	const embed = addEmbedFooter(
		new EmbedBuilder().setTitle(`Latest logs of ${targetGame}`).addFields(...fields)
	);

	await interaction.reply({ embeds: [embed] });
}
export async function gameTop(interaction: ChatInputCommandInteraction, filter: string) {
	// get target game
	const targetGame = interaction.options.getString("game", true);
	// load games db
	const db = trackerGames.get(targetGame);
	if (!db) {
		await interaction.reply(gameNoEntry);
		return;
	}

	// get users who played the game and sort them based of the filter and limit range to 0..5
	const users = db.users
		.sort((a, b) => (filter == "playtime" ? b.playtime - a.playtime : b.logs - a.logs))
		.splice(0, 5);

	// future embed fields
	const fields: APIEmbedField[] = [];

	// add a field per user
	await users.forEach(async (user) => {
		fields.push({
			inline: true,
			name: (await interaction.client.users.fetch(user.name)).username,
			value:
				filter == "playtime"
					? makeTimeString(user.playtime) + "\n" + user.logs + " logs"
					: user.logs + " logs\n" + makeTimeString(user.playtime),
		});
	});

	// add one final field for formatting purposes
	fields.push({ inline: true, name: "_ _", value: "_ _" });

	const embed = addEmbedFooter(
		new EmbedBuilder().setTitle(`Top user (${filter}) by ${targetGame}`).addFields(...fields)
	);

	await interaction.reply({ embeds: [embed] });
}
