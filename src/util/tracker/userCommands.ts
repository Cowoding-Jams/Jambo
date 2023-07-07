import { APIEmbedField, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { TrackerSublog, trackerUsers } from "../../db";
import { addEmbedFooter } from "../misc/embeds";
import {
	dayInMillis,
	discordLongDateWithShortTimeTimestamp,
	discordTimestamp,
	monthInMillis,
	weekInMillis,
} from "../misc/time";
import { makeTimeString, sortDbToString, sortGamesLogs, sortGamesPlaytime } from "./helper";
import { memberNotFound, userNoEntry, userNotFound } from "./messages";

export async function userStats(interaction: ChatInputCommandInteraction) {
	// get target user and default to command executer if not given
	const target = interaction.options.getUser("user") ?? interaction.user;
	const targetGame = interaction.options.getString("game");
	if (!target) {
		await interaction.reply(userNotFound);
		return;
	}
	// load db and get target user
	const db = trackerUsers.get(target.id);
	if (!db) {
		await interaction.reply(userNoEntry);
		return;
	}
	// get the member (to use their display name and color)
	const member = await interaction.guild?.members.fetch(target.id);
	if (!member) {
		await interaction.reply(memberNotFound);
		return;
	}
	// make sorted list of most played games and make string
	const mostPlayed = sortDbToString<TrackerSublog>(
		db.games.filter((v) => (targetGame ? v.name == targetGame : true)),
		(a, b) => b.playtime - a.playtime,
		(game) => `${game.name}: ${makeTimeString(game.playtime)}`
	);

	// make sorted list of most logged games and make string
	const mostLogged = sortDbToString<TrackerSublog>(
		db.games.filter((v) => (targetGame ? v.name == targetGame : true)),
		(a, b) => b.logs - a.logs,
		(game) => `${game.name}: ${game.logs} logs`
	);

	// get latest logs and make string
	const latestLogs = db.lastlogs
		.reverse()
		.map((log) => `${discordLongDateWithShortTimeTimestamp(log.date)} ${log.gameName}`)
		.join("\n");
	// get total users playtime, logs and games
	const totalPlaytime = targetGame
		? db.games
				.filter((v) => v.name == targetGame)
				.map((v) => v.playtime)
				.reduce((accumulator, currentValue) => accumulator + currentValue, 0)
		: db.playtime;
	const games = db.games.length;
	const totalLogs = targetGame
		? db.games
				.filter((v) => v.name == targetGame)
				.map((v) => v.logs)
				.reduce((accumulator, currentValue) => accumulator + currentValue, 0)
		: db.logs;
	// get first log
	const firstSeen = db.firstlog.date;
	// make range from first log to now
	const range = Date.now() - firstSeen;
	// calculate average playtime per day/week/month/user/log
	const playtimePer = `day: ${makeTimeString(
		Math.round(totalPlaytime / (range / dayInMillis))
	)}\nweek: ${makeTimeString(Math.round(totalPlaytime / (range / weekInMillis)))}\nmonth: ${makeTimeString(
		Math.round(totalPlaytime / (range / monthInMillis))
	)}${
		targetGame ? "" : "\ngame: " + makeTimeString(Math.round(totalPlaytime / games))
	}\nlog: ${makeTimeString(Math.round(totalPlaytime / totalLogs))}`;
	// temporary sorted list of games playtime/log
	const tmp = db.games.sort((a, b) => b.playtime / b.logs - a.playtime / a.logs)[0];
	// make string from first element of temporary list
	const mostPlaytime = `${tmp.name}: ${makeTimeString(tmp.playtime / tmp.logs)} - ${
		tmp.logs
	} logs\nTotal playtime: ${makeTimeString(tmp.playtime)}`;

	const embed = new EmbedBuilder().setTitle(
		targetGame
			? `${member.displayName}'s tracking stats about ${targetGame}`
			: `Tracking stats about ${member.displayName}`
	);
	if (!targetGame)
		embed.addFields(
			{ inline: true, name: "Most playtime", value: mostPlayed },
			{ inline: true, name: "Most logs", value: mostLogged },
			{ inline: false, name: "_ _", value: "_ _" }
		);
	embed.addFields(
		{
			inline: true,
			name: "Total...",
			value:
				"playtime: " +
				makeTimeString(totalPlaytime) +
				"\nlogs: " +
				totalLogs.toString() +
				(targetGame ? "" : "\ngames: " + games.toString()),
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
		}
	);
	if (!targetGame)
		embed.addFields(
			{ inline: false, name: "_ _", value: "_ _" },
			{ inline: true, name: "Latest logs", value: latestLogs }
		);

	await interaction.reply({ embeds: [embed] });
}
export async function userLast(interaction: ChatInputCommandInteraction) {
	// get target user, if not given default to executer
	const target = interaction.options.getUser("user") ?? interaction.user;
	if (!target) {
		await interaction.reply(userNotFound);
		return;
	}
	// get member from target
	const member = await interaction.guild?.members.fetch(target.id);
	if (member == undefined) {
		await interaction.reply(memberNotFound);
		return;
	}
	// get targets db entry
	const db = trackerUsers.get(member.id);
	if (!db) {
		await interaction.reply(userNoEntry);
		return;
	}
	// get latest logs
	const logs = db.lastlogs.reverse();
	// future embed fields
	const fields: APIEmbedField[] = [];

	// make field for every log
	logs.forEach((log) => {
		if (!log) return;
		fields.push({
			inline: true,
			name: log.gameName,
			value: `${discordLongDateWithShortTimeTimestamp(log.date)}\n${makeTimeString(log.playtime)}`,
		});
	});

	// add extra field for better formatting
	fields.push({ inline: true, name: "_ _", value: "_ _" });

	const embed = addEmbedFooter(
		new EmbedBuilder().setTitle(`Latest logs by ${member?.displayName}`).addFields(...fields)
	);

	await interaction.reply({ embeds: [embed] });
}
export async function userTop(interaction: ChatInputCommandInteraction, filter: string) {
	// get target user, default to executer if not given
	const target = interaction.options.getUser("user") ?? interaction.user;
	if (!target) {
		await interaction.reply(userNotFound);
		return;
	}
	// get the member from target
	const member = await interaction.guild?.members.fetch(target.id);
	if (member == undefined) {
		await interaction.reply(memberNotFound);
		return;
	}

	// load sorted list based on filter
	let games: TrackerSublog[] | undefined = [];
	if (filter == "logs") {
		games = sortGamesLogs(member.id);
	} else if (filter == "playtime") {
		games = sortGamesPlaytime(member.id);
	} else {
		return;
	}

	// return if no games are being listed
	if (!games) {
		await interaction.reply(userNoEntry);
		return;
	}

	// limit list to a range from 0 to 5
	games = games.slice(0, 5);

	// future embed fields
	const fields: APIEmbedField[] = [];
	// make field for every game based on filter
	games.forEach((game) => {
		fields.push({
			inline: true,
			name: game.name,
			value:
				filter == "playtime"
					? `${makeTimeString(game.playtime)}\n${game.logs} logs`
					: `${game.logs} logs\n${makeTimeString(game.playtime)}`,
		});
	});

	// add one extra field for better formatting
	fields.push({ inline: true, name: "_ _", value: "_ _" });

	const embed = addEmbedFooter(
		new EmbedBuilder().setTitle(`Top games (${filter}) by ${member?.displayName}`).addFields(...fields)
	);

	await interaction.reply({ embeds: [embed] });
}
