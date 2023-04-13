import { EmbedBuilder } from "@discordjs/builders";
import { APIEmbedField, ChatInputCommandInteraction, GuildMember, User } from "discord.js";
import { discordTimestamp, durationToReadable } from "../misc/time";
import { Duration } from "luxon";
import { trackerBlacklist, trackerGames, trackerLogs, TrackerSublog, trackerUsers } from "../../db";
import { config } from "../../config";
import { hasAdminPerms } from "../misc/permissions";

function makeTimeString(timeMS: number) {
	return durationToReadable(Duration.fromMillis(timeMS), true);
}

function makeEmbed(
	target: GuildMember,
	requester: User,
	mostLogged: string,
	mostPlayed: string,
	latestLogs: string,
	mostPlaytime: string,
	firstSeen: number,
	totalLogs: number,
	totalPlaytime: string,
	playtimePer: string
) {
	return new EmbedBuilder()
		.setAuthor({
			name: "Jambo",
			url: "https://github.com/Cowoding-Jams/Jambo",
			iconURL: "https://github.com/Cowoding-Jams/Jambo/blob/main/images/Robot.png",
		})
		.setColor(target.displayColor)
		.setTitle(`Tracking stats about ${target.displayName}`)
		.setFooter({ text: `Requested by ${requester.tag}`, iconURL: requester.displayAvatarURL({ size: 16 }) })
		.setTimestamp(Date.now())
		.addFields(
			{ inline: true, name: "Most logged games", value: mostLogged },
			{ inline: true, name: "Most played games", value: mostPlayed },
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
			{ inline: true, name: "Total playtime", value: totalPlaytime }
		);
}

function getTotalPlaytime(userId: string) {
	const data = trackerUsers.get(userId);
	let totalPlaytime = 0;
	data?.games.forEach((game) => {
		totalPlaytime += game.playtime;
	});
	return totalPlaytime;
}
function getPlaytimePerLog(userId: string) {
	const data = trackerUsers.get(userId);
	if (!data) return 0;
	return data.games.sort((a, b) => a.playtime / a.logs - b.playtime / b.logs).reverse();
}
function getTotalLogs(userId: string) {
	const data = trackerUsers.get(userId);
	let totalLogs = 0;
	data?.games.forEach((game) => {
		totalLogs += game.logs;
	});
	return totalLogs;
}
function getGames(userId: string) {
	const games = trackerUsers.get(userId)?.games.length;
	if (!games) return 1;
	return games;
}
function sortGamesPlaytime(userId: string) {
	const data = trackerUsers.get(userId);
	return data?.games.sort((a, b) => b.playtime - a.playtime);
}
function sortGamesLogs(userId: string) {
	const data = trackerUsers.get(userId);
	return data?.games.sort((a, b) => b.logs - a.logs);
}
function latestLogs(userId: string) {
	const data = trackerUsers.get(userId);
	if (!data) return ["0"];
	return data.lastlogs.reverse();
}

export async function userStats(interaction: ChatInputCommandInteraction) {
	const target = interaction.options.getUser("user") ? interaction.options.getUser("user") : interaction.user;
	if (!target) {
		await interaction.reply({ content: "User not found", ephemeral: true });
		return;
	}
	const member = await interaction.guild?.members.fetch(target.id);
	if (member == undefined) {
		await interaction.reply({ content: "User not found", ephemeral: true });
		return;
	}
	const games = sortGamesPlaytime(member.id);
	const logs = sortGamesLogs(member.id);
	if (!logs || !games) {
		await interaction.reply({ content: "User not enogth logs", ephemeral: true });
		return;
	}
	const totalPlaytime = getTotalPlaytime(member.id);
	const totalLogs = getTotalLogs(member.id);
	const userDB = trackerUsers.get(member.id);
	if (!userDB) {
		await interaction.reply({ content: "User not found", ephemeral: true });
		return;
	}
	const firstSeen = trackerLogs.get(userDB.firstlog)?.time;
	if (!firstSeen) {
		await interaction.reply({ content: "User not found", ephemeral: true });
		return;
	}
	const range = Date.now() - new Date(firstSeen).getTime();
	const playtimePerLog = getPlaytimePerLog(member.id);
	if (playtimePerLog == 0) {
		await interaction.reply({ content: "User not found", ephemeral: true });
		return;
	}
	const latest = playtimePerLog.at(-1);
	if (!latest) {
		await interaction.reply({ content: "User not found", ephemeral: true });
		return;
	}

	const embed = makeEmbed(
		member,
		interaction.user,
		logs
			.slice(0, 5)
			.map((game) => `${game.id}: ${game.logs}`)
			.join("\n"),
		games
			.slice(0, 5)
			.map((game) => `${game.id}: ${makeTimeString(game.playtime)}`)
			.join("\n"),
		latestLogs(member.id)
			.map((log) => `${trackerLogs.get(log)?.gameName}`)
			.join("\n"),
		`${playtimePerLog[0].id}: ${makeTimeString(playtimePerLog[0].playtime / playtimePerLog[0].logs)} - ${
			playtimePerLog[0].logs
		}logs\nTotal time: ${makeTimeString(playtimePerLog[0].playtime)}`,
		new Date(firstSeen).getTime(),
		totalLogs,
		makeTimeString(totalPlaytime),
		`day: ${makeTimeString(Math.round(totalPlaytime / (range / (86400 * 1000))))}\nweek: ${makeTimeString(
			Math.round(totalPlaytime / (range / 604800000))
		)}\nmonth: ${makeTimeString(Math.round(totalPlaytime / (range / 2628000000)))}\ngame: ${makeTimeString(
			Math.round(totalPlaytime / getGames(member.id))
		)}\nlog: ${makeTimeString(Math.round(totalPlaytime / totalLogs))}`
	);

	await interaction.reply({ embeds: [embed] });
}
export async function userLast(interaction: ChatInputCommandInteraction) {
	const target = interaction.options.getUser("user") ? interaction.options.getUser("user") : interaction.user;
	if (!target) {
		await interaction.reply({ content: "User not found", ephemeral: true });
		return;
	}
	const member = await interaction.guild?.members.fetch(target.id);
	if (member == undefined) {
		await interaction.reply({ content: "User not found", ephemeral: true });
		return;
	}
	const dbEntry = trackerUsers.get(member.id);
	if (!dbEntry) {
		await interaction.reply({ content: "User not enogth logs", ephemeral: true });
		return;
	}
	const logs = dbEntry.lastlogs.slice(0, 5).reverse();
	const fields: APIEmbedField[] = [];

	logs.forEach((log) => {
		const entry = trackerLogs.get(log);
		if (!entry) return;
		fields.push({
			inline: true,
			name: entry.gameName,
			value: `time: <t:${Math.floor(new Date(entry.time).getTime() / 1000)}:d><t:${Math.floor(
				new Date(entry.time).getTime() / 1000
			)}:t>\nplayed time: ${makeTimeString(entry.playtime)}`,
		});
	});

	fields.push({ inline: true, name: "_ _", value: "_ _" });

	const embed = new EmbedBuilder()
		.setColor(member.displayColor)
		.setAuthor({
			name: "Jambo",
			url: "https://github.com/Cowoding-Jams/Jambo",
			iconURL: "https://github.com/Cowoding-Jams/Jambo/blob/main/images/Robot.png",
		})
		.setTitle(`Latest logs by ${member?.displayName}`)
		.addFields(...fields);

	await interaction.reply({ embeds: [embed] });
}
export async function userTop(interaction: ChatInputCommandInteraction) {
	const target = interaction.options.getUser("user") ? interaction.options.getUser("user") : interaction.user;
	if (!target) {
		await interaction.reply({ content: "User not found", ephemeral: true });
		return;
	}
	const member = await interaction.guild?.members.fetch(target.id);
	if (member == undefined) {
		await interaction.reply({ content: "User not found", ephemeral: true });
		return;
	}

	const filter = interaction.options.getString("filter", true);

	let games: TrackerSublog[] | undefined = [];
	if (filter == "logs") {
		games = sortGamesLogs(member.id);
	} else if (filter == "playtime") {
		games = sortGamesPlaytime(member.id);
	} else {
		await interaction.reply({ content: "invalid filter", ephemeral: true });
		return;
	}

	if (!games) {
		await interaction.reply({ content: "not many logs", ephemeral: true });
		return;
	}

	games = games.slice(0, 5);

	const fields: APIEmbedField[] = [];
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

	fields.push({ inline: true, name: "_ _", value: "_ _" });

	const embed = new EmbedBuilder()
		.setColor(member.displayColor)
		.setAuthor({
			name: "Jambo",
			url: "https://github.com/Cowoding-Jams/Jambo",
			iconURL: "https://github.com/Cowoding-Jams/Jambo/blob/main/images/Robot.png",
		})
		.setTitle(`Top games (${filter}) by ${member?.displayName}`)
		.addFields(...fields);

	await interaction.reply({ embeds: [embed] });
}
export async function playtime(interaction: ChatInputCommandInteraction) {
	const targetUser = interaction.options.getUser("user")
		? interaction.options.getUser("user")
		: interaction.user;
	if (!targetUser) {
		await interaction.reply({ content: "User not found", ephemeral: true });
		return;
	}
	const member = await interaction.guild?.members.fetch(targetUser.id);
	if (member == undefined) {
		await interaction.reply({ content: "User not found", ephemeral: true });
		return;
	}

	const targetGame = interaction.options.getString("game", true);
	const db = trackerUsers
		.get(member.id)
		?.games.filter((game) => game.id.toLocaleLowerCase() == targetGame.toLocaleLowerCase());

	if (!db) {
		await interaction.reply({ content: "User not existing or not played game", ephemeral: true });
		return;
	}

	const playtime = db[0].playtime;

	const embed = new EmbedBuilder()
		.setTitle(`${member.displayName} has played ${makeTimeString(playtime)} of ${targetGame}`)
		.setColor(member.displayColor);

	await interaction.reply({ embeds: [embed] });
}
export async function logs(interaction: ChatInputCommandInteraction) {
	const targetUser = interaction.options.getUser("user")
		? interaction.options.getUser("user")
		: interaction.user;
	if (!targetUser) {
		await interaction.reply({ content: "User not found", ephemeral: true });
		return;
	}
	const member = await interaction.guild?.members.fetch(targetUser.id);
	if (member == undefined) {
		await interaction.reply({ content: "User not found", ephemeral: true });
		return;
	}

	const targetGame = interaction.options.getString("game", true);
	const db = trackerUsers
		.get(member.id)
		?.games.filter((game) => game.id.toLocaleLowerCase() == targetGame.toLocaleLowerCase());

	if (!db) {
		await interaction.reply({ content: "User not existing or not played game", ephemeral: true });
		return;
	}

	const logs = db[0].logs;

	const embed = new EmbedBuilder()
		.setTitle(`${member.displayName} has ${logs} logs in ${targetGame}`)
		.setColor(member.displayColor);

	await interaction.reply({ embeds: [embed] });
}
export async function latest(interaction: ChatInputCommandInteraction) {
	const fields: APIEmbedField[] = [];

	for (let i = trackerLogs.count; i > trackerLogs.count - config.activityLogRange; i--) {
		const data = trackerLogs.get(i.toString());
		if (!data) return;
		fields.push({
			inline: true,
			name: data.gameName,
			value: `user: <@${data.userid}>\ntime: <t:${Math.floor(
				new Date(data.time).getTime() / 1000
			)}:d><t:${Math.floor(new Date(data.time).getTime() / 1000)}:t>\ntime played: ${makeTimeString(
				data.playtime
			)}`,
		});
	}

	fields.push({ inline: true, name: "_ _", value: "_ _" });

	const embed = new EmbedBuilder()
		.setTitle("Latest logs")
		.setColor(0)
		.addFields(...fields);

	await interaction.reply({ embeds: [embed] });
}
export async function stats(interaction: ChatInputCommandInteraction) {
	const mostLoggedGame = trackerGames
		.array()
		.sort((a, b) => a.logs - b.logs)
		.reverse()
		.slice(0, 5)
		.map((game) => `${trackerLogs.get(game.lastlogs[0])?.gameName}: ${game.logs}`)
		.join("\n");
	const mostPlayedGame = trackerGames
		.array()
		.sort((a, b) => a.playtime - b.playtime)
		.reverse()
		.slice(0, 5)
		.map((game) => `${trackerLogs.get(game.lastlogs[0])?.gameName}: ${makeTimeString(game.playtime)}`)
		.join("\n");
	const mostLoggedUser = trackerUsers
		.array()
		.sort((a, b) => a.logs - b.logs)
		.reverse()
		.splice(0, 5)
		.map((user) => `<@${trackerLogs.get(user.lastlogs[0])?.userid}>: ${user.logs} logs`)
		.join("\n");
	const mostPlayedUser = trackerUsers
		.array()
		.sort((a, b) => a.playtime - b.playtime)
		.reverse()
		.splice(0, 5)
		.map((user) => `<@${trackerLogs.get(user.lastlogs[0])?.userid}>: ${makeTimeString(user.playtime)}`)
		.join("\n");
	const latestLogs = trackerLogs
		.array()
		.reverse()
		.slice(0, 5)
		.map(
			(log) =>
				`<t:${Math.floor(new Date(log.time).getTime() / 1000)}:d><t:${Math.floor(
					new Date(log.time).getTime() / 1000
				)}:t> <@${log.userid}> ${log.gameName}: ${makeTimeString(log.playtime)}`
		)
		.join("\n");
	const totalPlaytime = trackerGames
		.array()
		.map((game) => game.playtime)
		.reduce((partialSum, a) => partialSum + a, 0);
	const totalLogs = trackerGames
		.array()
		.map((game) => game.logs)
		.reduce((partialSum, a) => partialSum + a, 0);
	const firstSeen = new Date(trackerLogs.array()[0].time).getTime();
	const range = Date.now() - firstSeen;
	const games = trackerGames.count;
	const playtimePer = `day: ${makeTimeString(
		Math.round(totalPlaytime / (range / (86400 * 1000)))
	)}\nweek: ${makeTimeString(Math.round(totalPlaytime / (range / 604800000)))}\nmonth: ${makeTimeString(
		Math.round(totalPlaytime / (range / 2628000000))
	)}\ngame: ${makeTimeString(Math.round(totalPlaytime / games))}\nlog: ${makeTimeString(
		Math.round(totalPlaytime / totalLogs)
	)}`;
	const tmp = trackerGames.array().sort((a, b) => b.playtime / b.logs - a.playtime / b.logs)[0];
	const mostPlaytime = `${trackerLogs.get(tmp.lastlogs[0])?.gameName}: ${makeTimeString(
		tmp.playtime / tmp.logs
	)} - ${tmp.logs} logs\nTotal playtime: ${makeTimeString(tmp.playtime)}`;

	const embed = new EmbedBuilder()
		.setTitle("System stats")
		.setColor(0)
		.setFooter({
			text: `Requested by ${interaction.user.tag}`,
			iconURL: interaction.user.displayAvatarURL({ size: 16 }),
		})
		.setTimestamp(Date.now())
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
			{ inline: true, name: "Total playtime", value: makeTimeString(totalPlaytime) }
		);

	await interaction.reply({ embeds: [embed] });
}
export async function gameStats(interaction: ChatInputCommandInteraction) {
	const game = interaction.options.getString("game", true);
	const db = trackerGames.get(game.toLocaleLowerCase());
	if (!db) {
		await interaction.reply({ content: "not existingngngng", ephemeral: true });
		return;
	}

	const mostPlayed = db.users
		.sort((a, b) => b.playtime - a.playtime)
		.slice(0, 5)
		.map((user) => `<@${user.id}>: ${makeTimeString(user.playtime)}`)
		.join("\n");
	const mostLogged = db.users
		.sort((a, b) => b.logs - a.logs)
		.slice(0, 5)
		.map((user) => `<@${user.id}>: ${user.logs} logs`)
		.join("\n");
	const latestLogs = db.lastlogs.map((log) => `<@${trackerLogs.get(log)?.userid}>`).join("\n");
	const totalPlaytime = db.playtime;
	const totalLogs = db.logs;
	const firstSeen = new Date(trackerLogs.get(db.firstlog)?.time as string).getTime();
	const range = Date.now() - firstSeen;
	const users = db.users.length;
	const playtimePer = `day: ${makeTimeString(
		Math.round(totalPlaytime / (range / (86400 * 1000)))
	)}\nweek: ${makeTimeString(Math.round(totalPlaytime / (range / 604800000)))}\nmonth: ${makeTimeString(
		Math.round(totalPlaytime / (range / 2628000000))
	)}\nuser: ${makeTimeString(Math.round(totalPlaytime / users))}\nlog: ${makeTimeString(
		Math.round(totalPlaytime / totalLogs)
	)}`;
	const tmp = db.users.sort((a, b) => b.playtime / b.logs - a.playtime / a.logs)[0];
	const mostPlaytime = `<@${tmp.id}>: ${makeTimeString(tmp.playtime / tmp.logs)} - ${
		tmp.logs
	} logs\nTotal playtime: ${makeTimeString(tmp.playtime)}`;

	const embed = new EmbedBuilder()
		.setAuthor({
			name: "Jambo",
			url: "https://github.com/Cowoding-Jams/Jambo",
			iconURL: "https://github.com/Cowoding-Jams/Jambo/blob/main/images/Robot.png",
		})
		.setColor(0)
		.setTitle(`Tracking stats about ${game}`)
		.setFooter({
			text: `Requested by ${interaction.user.tag}`,
			iconURL: interaction.user.displayAvatarURL({ size: 16 }),
		})
		.setTimestamp(Date.now())
		.addFields(
			{ inline: true, name: "Most logged user", value: mostLogged },
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
	const target = interaction.options.getString("game", true);
	const db = trackerGames.get(target);
	if (!db) {
		await interaction.reply({ content: "Game not found or no logs", ephemeral: true });
		return;
	}

	const logs = db.lastlogs.slice(0, 5).reverse();
	const fields: APIEmbedField[] = [];

	await logs.forEach(async (log) => {
		const entry = trackerLogs.get(log);
		if (!entry) return;
		const user = await interaction.client.users.fetch(entry.userid);
		if (!user) return;
		fields.push({
			inline: true,
			name: user.username,
			value: `time: <t:${Math.floor(new Date(entry.time).getTime() / 1000)}:d><t:${Math.floor(
				new Date(entry.time).getTime() / 1000
			)}:t>\nplayed time: ${makeTimeString(entry.playtime)}`,
		});
	});

	fields.push({ inline: true, name: "_ _", value: "_ _" });

	const embed = new EmbedBuilder()
		.setColor(0)
		.setAuthor({
			name: "Jambo",
			url: "https://github.com/Cowoding-Jams/Jambo",
			iconURL: "https://github.com/Cowoding-Jams/Jambo/blob/main/images/Robot.png",
		})
		.setTitle(`Latest logs of ${target}`)
		.addFields(...fields)
		.setFooter({
			text: `Requested by ${interaction.user.tag}`,
			iconURL: interaction.user.displayAvatarURL({ size: 16 }),
		})
		.setTimestamp(Date.now());

	await interaction.reply({ embeds: [embed] });
}
export async function gameTop(interaction: ChatInputCommandInteraction) {
	const target = interaction.options.getString("game", true);
	if (!target) {
		await interaction.reply({ content: "Game not found", ephemeral: true });
		return;
	}
	const db = trackerGames.get(target);
	if (!db) {
		await interaction.reply({ content: "Game not found or no log", ephemeral: true });
		return;
	}

	const filter = interaction.options.getString("filter", true);
	if (filter == "playtime") {
		("");
	} else if (filter == "logs") {
		("");
	} else {
		interaction.reply({ content: "Invalid filter", ephemeral: true });
		return;
	}

	const users = db.users
		.sort((a, b) => (filter == "playtime" ? b.playtime - a.playtime : b.logs - a.logs))
		.splice(0, 5);
	const fields: APIEmbedField[] = [];

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

	fields.push({ inline: true, name: "_ _", value: "_ _" });

	const embed = new EmbedBuilder()
		.setColor(0)
		.setAuthor({
			name: "Jambo",
			url: "https://github.com/Cowoding-Jams/Jambo",
			iconURL: "https://github.com/Cowoding-Jams/Jambo/blob/main/images/Robot.png",
		})
		.setTitle(`Top user (${filter}) by ${target}`)
		.addFields(...fields)
		.setFooter({
			text: `Requested by ${interaction.user.tag}`,
			iconURL: interaction.user.displayAvatarURL({ size: 16 }),
		})
		.setTimestamp(Date.now());

	await interaction.reply({ embeds: [embed] });
}
export async function addBlacklist(interaction: ChatInputCommandInteraction) {
	if (!(await hasAdminPerms(interaction))) {
		interaction.reply({ content: "only admin can do this", ephemeral: true });
		return;
	}

	const game = interaction.options.getString("game", true);
	if (trackerBlacklist.get("")?.find((g) => g.toLowerCase() == game.toLowerCase())) {
		interaction.reply({ content: "Game already on blacklist", ephemeral: true });
		return;
	}
	trackerBlacklist.push("", game.toLowerCase());
	interaction.reply({ content: "Game added", ephemeral: true });
}
export async function remBlacklist(interaction: ChatInputCommandInteraction) {
	if (!(await hasAdminPerms(interaction))) {
		interaction.reply({ content: "only admin can do this", ephemeral: true });
		return;
	}

	const game = interaction.options.getString("game", true);
	const db = trackerBlacklist.get("");
	if (!db) return;
	if (db?.find((g) => g.toLowerCase() == game.toLowerCase())) {
		trackerBlacklist.set(
			"",
			db.filter((g) => g.toLowerCase() != game.toLowerCase())
		);
		interaction.reply({ content: "Game removed", ephemeral: true });
		return;
	}
	interaction.reply({ content: "Game not on blacklist", ephemeral: true });
}
