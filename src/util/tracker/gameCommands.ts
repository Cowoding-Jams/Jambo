import { APIEmbedField, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { config } from "../../config";
import { trackerGames, trackerLogs } from "../../db";
import { discordTimestamp } from "../misc/time";
import { makeTimeString } from "./helper";
import { GAMENOENTRY, INVALIDFILTER } from "./messages";

export async function gameStats(interaction: ChatInputCommandInteraction) {
	// get game option
	const targetGame = interaction.options.getString("game", true);

	// load tracker Games db
	const db = trackerGames.get(targetGame.toLocaleLowerCase());
	if (!db) {
		await interaction.reply(GAMENOENTRY);
		return;
	}

	// get top 5 played games and make a string
	const mostPlayed = db.users
		.sort((a, b) => b.playtime - a.playtime)
		.slice(0, 5)
		.map((user) => `<@${user.id}>: ${makeTimeString(user.playtime)}`)
		.join("\n");
	// get top 5 logged games and make a string
	const mostLogged = db.users
		.sort((a, b) => b.logs - a.logs)
		.slice(0, 5)
		.map((user) => `<@${user.id}>: ${user.logs} logs`)
		.join("\n");
	// format latest logs into a string
	const latestLogs = db.lastlogs.map((log) => `<@${trackerLogs.get(log)?.userid}>`).join("\n");
	// get total playtime, logs and users
	const totalPlaytime = db.playtime;
	const totalLogs = db.logs;
	const users = db.users.length;
	// get first log of game             (first log is iso string)
	const firstSeen = new Date(trackerLogs.get(db.firstlog)?.time as string).getTime();
	// calculate the range from first log to now
	const range = Date.now() - firstSeen;
	// calculate daily/weekly/monthly and per-log average playtime
	const playtimePer = `day: ${makeTimeString(
		Math.round(totalPlaytime / (range / (86400 * 1000)))
	)}\nweek: ${makeTimeString(Math.round(totalPlaytime / (range / 604800000)))}\nmonth: ${makeTimeString(
		Math.round(totalPlaytime / (range / 2628000000))
	)}\nuser: ${makeTimeString(Math.round(totalPlaytime / users))}\nlog: ${makeTimeString(
		Math.round(totalPlaytime / totalLogs)
	)}`;
	// temporary sorted list of most playtime/log (users)
	const tmp = db.users.sort((a, b) => b.playtime / b.logs - a.playtime / a.logs)[0];
	// make most playtime/log string
	const mostPlaytime = `<@${tmp.id}>: ${makeTimeString(tmp.playtime / tmp.logs)} - ${
		tmp.logs
	} logs\nTotal playtime: ${makeTimeString(tmp.playtime)}`;

	const embed = new EmbedBuilder()
		.setAuthor({
			name: config.botName,
			url: config.githubURL,
			iconURL: config.iconURL,
		})
		.setColor(config.color)
		.setTitle(`Tracking stats about ${targetGame}`)
		.addFields(
			{ inline: true, name: "Most logged users", value: mostLogged },
			{ inline: true, name: "User with most playtime", value: mostPlayed },
			{ inline: false, name: "_ _", value: "_ _" },
			{ inline: true, name: "Latest logs", value: latestLogs },
			{ inline: true, name: "(Average) playtime per", value: playtimePer },
			{ inline: false, name: "_ _", value: "_ _" },
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
			{ inline: true, name: "Total playtime", value: makeTimeString(totalPlaytime) }
		);

	await interaction.reply({ embeds: [embed] });
}
export async function gameLast(interaction: ChatInputCommandInteraction) {
	// get the target game
	const targetGame = interaction.options.getString("game", true);
	// load games db
	const db = trackerGames.get(targetGame);
	if (!db) {
		await interaction.reply(GAMENOENTRY);
		return;
	}

	// get latest logs
	const logs = db.lastlogs.reverse();
	// store future embed fields
	const fields: APIEmbedField[] = [];

	// make embed field for every log
	await logs.forEach(async (log) => {
		// get and validate log (db.lastlogs is a list of numbers as strings, not the actual log)
		const entry = trackerLogs.get(log);
		if (!entry) return;
		// get user who owns the log
		const user = await interaction.client.users.fetch(entry.userid);
		// skip if user doesnt exist anymore
		if (!user) return;

		// make field
		fields.push({
			inline: true,
			name: user.username,
			value: `<t:${Math.floor(new Date(entry.time).getTime() / 1000)}:d><t:${Math.floor(
				new Date(entry.time).getTime() / 1000
			)}:t>\n${makeTimeString(entry.playtime)}`,
		});
	});

	// add a last field so embed looks better formatted
	fields.push({ inline: true, name: "_ _", value: "_ _" });

	const embed = new EmbedBuilder()
		.setColor(config.color)
		.setAuthor({
			name: config.botName,
			url: config.githubURL,
			iconURL: config.iconURL,
		})
		.setTitle(`Latest logs of ${targetGame}`)
		.addFields(...fields);

	await interaction.reply({ embeds: [embed] });
}
export async function gameTop(interaction: ChatInputCommandInteraction) {
	// get target game
	const targetGame = interaction.options.getString("game", true);
	// load games db
	const db = trackerGames.get(targetGame);
	if (!db) {
		await interaction.reply(GAMENOENTRY);
		return;
	}

	// get and validate filter
	const filter = interaction.options.getString("filter", true);
	if (!(filter == "playtime" || filter == "logs")) {
		interaction.reply(INVALIDFILTER);
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
			name: (await interaction.client.users.fetch(user.id)).username,
			value:
				filter == "playtime"
					? makeTimeString(user.playtime) + "\n" + user.logs + " logs"
					: user.logs + " logs\n" + makeTimeString(user.playtime),
		});
	});

	// add one final field for formatting purposes
	fields.push({ inline: true, name: "_ _", value: "_ _" });

	const embed = new EmbedBuilder()
		.setColor(config.color)
		.setAuthor({
			name: config.botName,
			url: config.githubURL,
			iconURL: config.iconURL,
		})
		.setTitle(`Top user (${filter}) by ${targetGame}`)
		.addFields(...fields);

	await interaction.reply({ embeds: [embed] });
}
