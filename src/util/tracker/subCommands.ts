import { EmbedBuilder } from "discord.js";
import { APIEmbedField, ChatInputCommandInteraction } from "discord.js";
import { discordTimestamp, shortDateAndShortTimeTimestamp } from "../misc/time";
import { TrackerGame, trackerGames, trackerLogs, TrackerUser, trackerUsers } from "../../db";
import { config } from "../../config";
import { makeTimeString, sortDbToString } from "./helper";
import { gameNoEntry, userNoEntry, userNoGameEntry } from "./messages";
import { addEmbedFooter } from "../misc/embeds";

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
		text = `${targetUser.username} has ${makeTimeString(db.playtime)} of playtime`;
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
		text = `${targetUser.username} has ${makeTimeString(db.playtime)} of playtime in ${targetGame}`;
	} else {
		// shouldn't happen but just in case a return
		return;
	}

	await interaction.reply({
		embeds: [new EmbedBuilder().setTitle(text).setColor(config.color)],
	});
}
export async function logs(interaction: ChatInputCommandInteraction) {
	// get target user and game
	const targetUser = interaction.options.getUser("user") ?? interaction.user;
	const targetGame = interaction.options.getString("game");
	let text = ""; // used later in the final embed

	// make matching text for each case
	if (!targetUser && !targetGame) {
		// no u ser, no game
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
		text = `${targetGame} was played ${db.logs} times`;
	} else if (targetUser && !targetGame) {
		// user, no game
		// get target db user entry
		const db = trackerUsers.get(targetUser.id);
		if (!db) {
			await interaction.reply(userNoEntry);
			return;
		}
		text = `${targetUser.username} was logged ${db.logs} times`;
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
		text = `${targetUser.username} has played ${targetGame} ${db.logs} times`;
	} else {
		return;
	}

	await interaction.reply({
		embeds: [new EmbedBuilder().setTitle(text).setColor(config.color)],
	});
}
export async function latest(interaction: ChatInputCommandInteraction) {
	// future embed fields
	const fields: APIEmbedField[] = [];

	// latest system logs
	const logs = trackerLogs
		.array()
		.sort((a, b) => b.date.getTime() - a.date.getTime())
		.slice(0, 5);

	// make embed for each log
	logs.forEach((log) =>
		fields.push({
			inline: true,
			name: log.gameName,
			value: `<@${log.userID}>\n${shortDateAndShortTimeTimestamp(
				log.date.getTime() / 1000
			)}\n${makeTimeString(log.playtime)}`,
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
				`${shortDateAndShortTimeTimestamp(log.date.getTime() / 1000)} <@${log.userID}> ${
					log.gameName
				}: ${makeTimeString(log.playtime)}`
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
	// get first log               (time is iso string)
	const firstSeen = trackerLogs.array()[0].date.getTime();
	// make range from first log to now
	const range = Date.now() - firstSeen;
	// calculate average playtime per day/week/month/game/log
	const playtimePer = `day: ${makeTimeString(
		Math.round(totalPlaytime / (range / (86400 * 1000)))
	)}\nweek: ${makeTimeString(Math.round(totalPlaytime / (range / 604800000)))}\nmonth: ${makeTimeString(
		Math.round(totalPlaytime / (range / 2628000000))
	)}\ngame: ${makeTimeString(Math.round(totalPlaytime / games))}\nuser: ${makeTimeString(
		Math.round(totalPlaytime / users)
	)}\nlog: ${makeTimeString(Math.round(totalPlaytime / totalLogs))}`;
	// temporary sorted list based on playtime/log
	const tmp = trackerGames.array().sort((a, b) => b.playtime / b.logs - a.playtime / b.logs)[0];
	// make string from temporary list
	const mostPlaytime = `${tmp.lastlogs[0].gameName}: ${makeTimeString(
		Math.round(tmp.playtime / tmp.logs)
	)} - ${tmp.logs} logs\nTotal playtime: ${makeTimeString(tmp.playtime)}`;

	const embed = addEmbedFooter(
			new EmbedBuilder()
				.setTitle("System stats")
				.addFields(
					{ inline: true, name: "Most logged games", value: mostLoggedGame },
					{ inline: true, name: "Most played games", value: mostPlayedGame },
					{ inline: false, name: "_ _", value: "_ _" },
					{ inline: true, name: "Most logged users", value: mostLoggedUser },
					{ inline: true, name: "Users with most playtime", value: mostPlayedUser },
					{ inline: false, name: "_ _", value: "_ _" },
					{ inline: true, name: "Latest logs", value: latestLogs },
					{ inline: false, name: "_ _", value: "_ _" },
					{ inline: true, name: "(Average) playtime per", value: playtimePer },
					{ inline: true, name: "(Average) most playtime/log", value: mostPlaytime },
					{ inline: false, name: "_ _", value: "_ _" },
					{
						inline: true,
						name: "Record range",
						value: `${discordTimestamp(Math.floor(firstSeen / 1000))} -> ${discordTimestamp(
							Math.floor(Date.now() / 1000)
						)}(now)\n${makeTimeString(Date.now() - firstSeen)}`,
					},
					{ inline: false, name: "_ _", value: "_ _" },
					{ inline: true, name: "Total logs", value: totalLogs.toString() },
					{ inline: true, name: "Total playtime", value: makeTimeString(totalPlaytime) },
					{ inline: false, name: "_ _", value: "_ _" },
					{ inline: true, name: "Total games", value: games.toString() },
					{ inline: true, name: "Total users", value: users.toString() }
				)
			)

	await interaction.reply({ embeds: [embed] });
}
