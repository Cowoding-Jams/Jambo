import { APIEmbedField, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { config } from "../../config";
import { trackerGames, trackerLogs, TrackerSublog } from "../../db";
import { addEmbedFooter } from "../misc/embeds";
import {
	dayInSeconds,
	discordLongDateWithShortTimeTimestamp,
	discordTimestamp,
	hourInSeconds,
	monthInSeconds,
	weekInSeconds,
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
		.map(
			(log) =>
				`${discordLongDateWithShortTimeTimestamp(log.date / 1000)} <@${trackerLogs.get(log.id)?.userID}>`
		)
		.join("\n");
	// get total playtime, logs and users
	const totalPlaytime = db.playtime;
	const totalLogs = db.logs;
	const users = db.users.length;
	// get first log of game
	const firstSeen = db.firstlog.date;
	// calculate the range from first log to now
	const range = ~~((Date.now() - firstSeen) / 1000);

	const playtimePerDay = makeTimeString(totalPlaytime / (range / dayInSeconds));
	const playtimePerWeek = makeTimeString(totalPlaytime / (range / weekInSeconds));
	const playtimePerMonth = makeTimeString(totalPlaytime / (range / monthInSeconds));
	const playtimePerUser = makeTimeString(totalPlaytime / users);
	const playtimePerLog = makeTimeString(totalPlaytime / totalLogs);
	const playtimePer = `day: ${playtimePerDay}\nweek: ${playtimePerWeek}\nmonth: ${playtimePerMonth}\nuser: ${playtimePerUser}\nhour: ${playtimePerLog}`;

	const logsPerDay = Math.round(totalLogs / (range / dayInSeconds));
	const logsPerWeek = Math.round(totalLogs / (range / weekInSeconds));
	const logsPerMonth = Math.round(totalLogs / (range / monthInSeconds));
	const logsPerUser = Math.round(totalLogs / users);
	const logsPerHour = Math.round(totalLogs / (totalPlaytime / hourInSeconds));
	const logsPer = `day: ${logsPerDay}\nweek: ${logsPerWeek}\nmonth: ${logsPerMonth}\nuser: ${logsPerUser}\nhour: ${logsPerHour}`;

	const embed = new EmbedBuilder()
		.setColor(config.color)
		.setTitle(`Tracking stats about ${targetGame}`)
		.addFields(
			{ inline: true, name: "Most playtime", value: mostPlayed },
			{ inline: true, name: "Most logs", value: mostLogged },
			{ inline: false, name: "_ _", value: "_ _" },
			{ inline: true, name: "(Average) playtime per", value: playtimePer },
			{ inline: true, name: "(Average) logs per", value: logsPer },
			{ inline: false, name: "_ _", value: "_ _" },
			{
				inline: true,
				name: "Record range",
				value: `${discordTimestamp(Math.floor(firstSeen / 1000))} -> ${discordTimestamp(
					Math.floor(Date.now() / 1000)
				)}(now)\n${makeTimeString(Math.floor((Date.now() - firstSeen) / 1000))}`,
			},
			{ inline: false, name: "_ _", value: "_ _" },
			{ inline: true, name: "Latest logs", value: latestLogs },
			{
				inline: false,
				name: "Total...",
				value: "Playtime: " + makeTimeString(totalPlaytime) + "\nlogs: " + totalLogs.toString(),
			}
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
