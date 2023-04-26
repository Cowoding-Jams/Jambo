import { APIEmbedField, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { config } from "../../config";
import { trackerLogs, TrackerSublog, trackerUsers } from "../../db";
import { discordTimestamp } from "../misc/time";
import { makeTimeString, sortGamesLogs, sortGamesPlaytime } from "./helper";
import { memberNotFound, userNoEntry, userNotFound } from "./messages";

export async function userStats(interaction: ChatInputCommandInteraction) {
	// get target user and default to command executer if not given
	const target = interaction.options.getUser("user") ? interaction.options.getUser("user") : interaction.user;
	if (!target) {
		await interaction.reply(userNotFound);
		return;
	}
	// get the member (to use their display name and color)
	const member = await interaction.guild?.members.fetch(target.id);
	if (!member) {
		await interaction.reply(memberNotFound);
		return;
	}
	// load db and get target user
	const db = trackerUsers.get(target.id);
	if (!db) {
		await interaction.reply(userNoEntry);
		return;
	}

	// make sorted list of most played games and make string
	const mostPlayed = db.games
		.sort((a, b) => b.playtime - a.playtime)
		.slice(0, 5)
		.map((game) => `${game.id}: ${makeTimeString(game.playtime)}`)
		.join("\n");
	// make sorted list of most logged games and make string
	const mostLogged = db.games
		.sort((a, b) => b.logs - a.logs)
		.slice(0, 5)
		.map((game) => `${game.id}: ${game.logs} logs`)
		.join("\n");
	// get latest logs and make string
	const latestLogs = db.lastlogs.map((log) => `${trackerLogs.get(log)?.gameName}`).join("\n");
	// get total users playtime, logs and games
	const totalPlaytime = db.playtime;
	const games = db.games.length;
	const totalLogs = db.logs;
	// get first  log							    (time is iso string)
	const firstSeen = new Date(trackerLogs.get(db.firstlog)?.time as string).getTime();
	// make range from first log to now
	const range = Date.now() - firstSeen;
	// calculate average paytime per day/week/month/user/log
	const playtimePer = `day: ${makeTimeString(
		Math.round(totalPlaytime / (range / (86400 * 1000)))
	)}\nweek: ${makeTimeString(Math.round(totalPlaytime / (range / 604800000)))}\nmonth: ${makeTimeString(
		Math.round(totalPlaytime / (range / 2628000000))
	)}\ngame: ${makeTimeString(Math.round(totalPlaytime / games))}\nlog: ${makeTimeString(
		Math.round(totalPlaytime / totalLogs)
	)}`;
	// temporary sorted list of games playtime/log
	const tmp = db.games.sort((a, b) => b.playtime / b.logs - a.playtime / a.logs)[0];
	// make string from first element of temporary list
	const mostPlaytime = `${tmp.id}: ${makeTimeString(tmp.playtime / tmp.logs)} - ${
		tmp.logs
	} logs\nTotal playtime: ${makeTimeString(tmp.playtime)}`;

	const embed = new EmbedBuilder()
		.setAuthor({
			name: config.botName,
			url: config.githubURL,
			iconURL: config.iconURL,
		})
		.setColor(member.displayColor)
		.setTitle(`Tracking stats about ${member.displayName}`)
		.addFields(
			{ inline: true, name: "Most logged game", value: mostLogged },
			{ inline: true, name: "Game with most playtime", value: mostPlayed },
			{ inline: false, name: "_ _", value: "_ _" },
			{ inline: true, name: "Latest logs", value: latestLogs },
			{ inline: true, name: "(Average) playtime per", value: playtimePer },
			{ inline: false, name: "_ _", value: "_ _" },
			{ inline: true, name: "(Average) most playtime/log", value: mostPlaytime },
			{ inline: true, name: "Total played games", value: games.toString() },
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
export async function userLast(interaction: ChatInputCommandInteraction) {
	// get target user, if not given default to executer
	const target = interaction.options.getUser("user") ? interaction.options.getUser("user") : interaction.user;
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
		// get log entry (latest logs is list of number as string, not the actual log data)
		const entry = trackerLogs.get(log);
		if (!entry) return;
		fields.push({
			inline: true,
			name: entry.gameName,
			value: `<t:${Math.floor(new Date(entry.time).getTime() / 1000)}:d><t:${Math.floor(
				new Date(entry.time).getTime() / 1000
			)}:t>\n${makeTimeString(entry.playtime)}`,
		});
	});

	// add extra field for better formatting
	fields.push({ inline: true, name: "_ _", value: "_ _" });

	const embed = new EmbedBuilder()
		.setColor(member.displayColor)
		.setAuthor({
			name: config.botName,
			url: config.githubURL,
			iconURL: config.iconURL,
		})
		.setTitle(`Latest logs by ${member?.displayName}`)
		.addFields(...fields);

	await interaction.reply({ embeds: [embed] });
}
export async function userTop(interaction: ChatInputCommandInteraction, filter: string) {
	// get target user, default to executer if not given
	const target = interaction.options.getUser("user") ? interaction.options.getUser("user") : interaction.user;
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
			name: game.id,
			value:
				filter == "playtime"
					? `${makeTimeString(new Date(game.playtime).getTime())}\n${game.logs} logs`
					: `${game.logs} logs\n${makeTimeString(new Date(game.playtime).getTime())}`,
		});
	});

	// add one extra field for better formatting
	fields.push({ inline: true, name: "_ _", value: "_ _" });

	const embed = new EmbedBuilder()
		.setColor(member.displayColor)
		.setAuthor({
			name: config.botName,
			url: config.githubURL,
			iconURL: config.iconURL,
		})
		.setTitle(`Top games (${filter}) by ${member?.displayName}`)
		.addFields(...fields);

	await interaction.reply({ embeds: [embed] });
}
