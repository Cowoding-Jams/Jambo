import { EmbedBuilder } from "discord.js";
import { APIEmbedField, ChatInputCommandInteraction } from "discord.js";
import {
	dayInSeconds,
	discordLongDateWithShortTimeTimestamp,
	discordTimestamp,
	hourInSeconds,
	monthInSeconds,
	shortDateAndShortTimeTimestamp,
	weekInSeconds,
} from "../misc/time";
import { TrackerGame, trackerGames, trackerLogs, TrackerUser, trackerUsers } from "../../db";
import { config } from "../../config";
import { makeTimeString, sortDbToString } from "./helper";
import { gameNoEntry, userNoEntry, userNoGameEntry } from "./messages";
import { addEmbedFooter } from "../misc/embeds";
import { userLast } from "./userCommands";
import { gameLast } from "./gameCommands";

export async function playtime(interaction: ChatInputCommandInteraction) {
	// get target user and game
	const targetUser = interaction.options.getUser("user");
	const targetGame = interaction.options.getString("game");
	let text = ""; // used later in the final embed

	// make matching text for each case
	if (!targetUser && !targetGame) {
		// no user, no game
		let playtime = 0;
		// count all played times of all games together
		trackerGames.array().forEach((game) => (playtime += game.playtime));
		text = `The whole system has tracked ${makeTimeString(playtime)} of playtime`;
	} else if (!targetUser && targetGame) {
		// no user, game
		// load db and get target game
		const db = trackerGames.get(targetGame.toLowerCase());
		if (!db) {
			await interaction.reply(gameNoEntry);
			return;
		}
		text = `${targetGame} has ${makeTimeString(db.playtime)} of playtime`;
	} else if (targetUser && !targetGame) {
		// user, no game
		// load db and get target user
		const db = trackerUsers.get(targetUser.id);
		if (!db) {
			await interaction.reply(userNoEntry);
			return;
		}
		text = `${targetUser} has ${makeTimeString(db.playtime)} of playtime`;
	} else if (targetUser && targetGame) {
		// user, game
		// load db and get user.games and find target game in there
		const db = trackerUsers
			.get(targetUser.id)
			?.games.find((g) => g.name.toLowerCase() == targetGame.toLowerCase());
		if (!db) {
			await interaction.reply(userNoGameEntry);
			return;
		}
		text = `${targetUser} has ${makeTimeString(db.playtime)} of playtime in ${targetGame}`;
	} else {
		text = "error";
	}

	await interaction.reply({
		embeds: [new EmbedBuilder().setTitle("playtime").setDescription(text).setColor(config.color)],
	});
}
export async function logs(interaction: ChatInputCommandInteraction) {
	// get target user and game
	const targetUser = interaction.options.getUser("user");
	const targetGame = interaction.options.getString("game");
	let text = ""; // used later in the final embed

	// make matching text for each case
	if (!targetUser && !targetGame) {
		// no user, no game
		let logs = 0;
		// count all logs of all games together
		trackerGames.array().forEach((game) => (logs += game.logs));
		text = `The whole system has tracked ${logs} times`;
	} else if (!targetUser && targetGame) {
		// no user, game
		// get target db game entry
		const db = trackerGames.get(targetGame.toLowerCase());
		if (!db) {
			await interaction.reply(gameNoEntry);
			return;
		}
		text = `${targetGame} was logged ${db.logs} times`;
	} else if (targetUser && !targetGame) {
		// user, no game
		// get target db user entry
		const db = trackerUsers.get(targetUser.id);
		if (!db) {
			await interaction.reply(userNoEntry);
			return;
		}
		text = `${targetUser.toString()} was logged ${db.logs} times`;
	} else if (targetUser && targetGame) {
		// user, game
		// load db and get user.games and find target game in there
		const db = trackerUsers
			.get(targetUser.id)
			?.games.find((g) => g.name.toLowerCase() == targetGame.toLowerCase());
		if (!db) {
			await interaction.reply(userNoGameEntry);
			return;
		}
		text = `${targetUser.toString()} has played ${targetGame} ${db.logs} times`;
	} else {
		text = "error";
	}

	await interaction.reply({
		embeds: [new EmbedBuilder().setTitle("logs").setDescription(text).setColor(config.color)],
	});
}
export async function latest(interaction: ChatInputCommandInteraction) {
	const user = interaction.options.getUser("user");
	const game = interaction.options.getString("game");

	if (user) {
		await userLast(interaction);
	} else if (game) {
		await gameLast(interaction);
	} else {
		// future embed fields
		const fields: APIEmbedField[] = [];
		// latest system logs
		const logs = trackerLogs
			.array()
			.sort((a, b) => b.date - a.date)
			.slice(0, 5);

		// make embed for each log
		logs.forEach((log) =>
			fields.push({
				inline: true,
				name: log.gameName,
				value: `<@${log.userID}>\n${discordLongDateWithShortTimeTimestamp(log.date)}\n${makeTimeString(
					log.playtime
				)}`,
			})
		);
		// add empty field for better formatting
		fields.push({ inline: true, name: "_ _", value: "_ _" });

		const embed = new EmbedBuilder()
			.setTitle("Latest logs")
			.setColor(config.color)
			.addFields(...fields);

		await interaction.reply({ embeds: [embed] });
	}
}
export async function stats(interaction: ChatInputCommandInteraction) {
	// get 5 most logged games and make string
	const mostLoggedGame = sortDbToString<TrackerGame>(
		trackerGames.array(),
		(a, b) => b.logs - a.logs,
		(game) => `${game.lastlogs[0].gameName}: ${game.logs}`
	);

	// get 5 most played games and make string
	const mostPlayedGame = sortDbToString<TrackerGame>(
		trackerGames.array(),
		(a, b) => b.playtime - a.playtime,
		(game) => `${game.lastlogs[0].gameName}: ${makeTimeString(game.playtime)}`
	);

	// get 5 most logged users and make string
	const mostLoggedUser = sortDbToString<TrackerUser>(
		trackerUsers.array(),
		(a, b) => b.logs - a.logs,
		(user) => `<@${user.lastlogs[0].userID}>: ${user.logs} logs`
	);

	// get 5 most playtime users and make string
	const mostPlayedUser = sortDbToString<TrackerUser>(
		trackerUsers.array(),
		(a, b) => b.playtime - a.playtime,
		(user) => `<@${user.lastlogs[0].userID}>: ${makeTimeString(user.playtime)}`
	);

	// get latest system wide logs and make string
	const latestLogs = trackerLogs
		.array()
		.reverse()
		.slice(0, 5)
		.map(
			(log) =>
				`${shortDateAndShortTimeTimestamp(log.date)} <@${log.userID}> ${log.gameName}: ${makeTimeString(
					log.playtime
				)}`
		)
		.join("\n");
	// get total playtime of all games
	const totalPlaytime = trackerGames
		.array()
		.map((game) => game.playtime)
		.reduce((partialSum, a) => partialSum + a, 0);
	// get amount of logs
	const totalLogs = trackerLogs.count;
	// get amount of games
	const games = trackerGames.count;
	// get amount of users
	const users = trackerUsers.count;
	// get first log
	const firstSeen = trackerLogs.array()[0].date;
	// make range from first log to now
	const range = ~~((Date.now() - firstSeen) / 1000);

	const playtimePerDay = makeTimeString(totalPlaytime / (range / dayInSeconds));
	const playtimePerWeek = makeTimeString(totalPlaytime / (range / weekInSeconds));
	const playtimePerMonth = makeTimeString(totalPlaytime / (range / monthInSeconds));
	const playtimePerGame = makeTimeString(totalPlaytime / games);
	const playtimePerUser = makeTimeString(totalPlaytime / users);
	const playtimePerLog = makeTimeString(totalPlaytime / totalLogs);
	const playtimePer = `day: ${playtimePerDay}\nweek: ${playtimePerWeek}\nmonth: ${playtimePerMonth}\ngame: ${playtimePerGame}\nuser: ${playtimePerUser}\nlog: ${playtimePerLog}`;

	const logsPerDay = Math.round(totalLogs / (range / dayInSeconds));
	const logsPerWeek = Math.round(totalLogs / (range / weekInSeconds));
	const logsPerMonth = Math.round(totalLogs / (range / monthInSeconds));
	const logsPerUser = Math.round(totalLogs / users);
	const logsPerGame = Math.round(totalLogs / games);
	const logsPerHour = Math.round(totalLogs / (totalPlaytime / hourInSeconds));
	const logsPer = `day: ${logsPerDay}\nweek: ${logsPerWeek}\nmonth: ${logsPerMonth}\ngame: ${logsPerGame}\nuser: ${logsPerUser}\nhour: ${logsPerHour}`;

	const embed = addEmbedFooter(
		new EmbedBuilder().setTitle("System stats").addFields(
			{ inline: true, name: "Most played games", value: mostPlayedGame },
			{ inline: true, name: "Most logged games", value: mostLoggedGame },
			{ inline: false, name: "_ _", value: "_ _" },
			{ inline: true, name: "Most playtime", value: mostPlayedUser },
			{ inline: true, name: "Most logs", value: mostLoggedUser },
			{ inline: false, name: "_ _", value: "_ _" },
			{ inline: true, name: "Latest logs", value: latestLogs },
			{ inline: false, name: "_ _", value: "_ _" },
			{ inline: true, name: "(Average) playtime per", value: playtimePer },
			{ inline: true, name: "(Average) logs per", value: logsPer },
			{ inline: false, name: "_ _", value: "_ _" },
			{
				inline: true,
				name: "Record range",
				value: `${discordTimestamp(Math.floor(firstSeen / 1000))} -> ${discordTimestamp(
					Math.floor(Date.now() / 1000)
				)}(now)\n${makeTimeString(Math.floor((Date.now() - firstSeen) / 100))}`,
			},
			{ inline: false, name: "_ _", value: "_ _" },
			{
				inline: true,
				name: "Total...",
				value:
					"logs: " +
					totalLogs.toString() +
					"\nplaytime: " +
					makeTimeString(totalPlaytime) +
					"\ngames: " +
					games.toString() +
					"\nusers: " +
					users.toString(),
			}
		)
	);

	await interaction.reply({ embeds: [embed] });
}
