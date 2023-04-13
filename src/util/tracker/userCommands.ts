import { APIEmbedField, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { config } from "../../config";
import { trackerLogs, TrackerSublog, trackerUsers } from "../../db";
import { discordTimestamp } from "../misc/time";
import { makeTimeString, sortGamesLogs, sortGamesPlaytime } from "./helper";
import { INVALIDFILTER, MEMBERNOTFOUND, USERNOENTRY, USERNOTFOUND } from "./messages";

export async function userStats(interaction: ChatInputCommandInteraction) {
	const target = interaction.options.getUser("user") ? interaction.options.getUser("user") : interaction.user;
	if (!target) {
		await interaction.reply(USERNOTFOUND);
		return;
	}
	const member = await interaction.guild?.members.fetch(target.id);
	if (!member) {
		await interaction.reply(MEMBERNOTFOUND);
		return;
	}
	const db = trackerUsers.get(target.id);
	if (!db) {
		await interaction.reply(USERNOENTRY);
		return;
	}

	const mostPlayed = db.games
		.sort((a, b) => b.playtime - a.playtime)
		.slice(0, 5)
		.map((game) => `${game.id}: ${makeTimeString(game.playtime)}`)
		.join("\n");
	const mostLogged = db.games
		.sort((a, b) => b.logs - a.logs)
		.slice(0, 5)
		.map((game) => `${game.id}: ${game.logs} logs`)
		.join("\n");
	const latestLogs = db.lastlogs.map((log) => `${trackerLogs.get(log)?.gameName}`).join("\n");
	const totalPlaytime = db.playtime;
	const totalLogs = db.logs;
	const firstSeen = new Date(trackerLogs.get(db.firstlog)?.time as string).getTime();
	const range = Date.now() - firstSeen;
	const games = db.games.length;
	const playtimePer = `day: ${makeTimeString(
		Math.round(totalPlaytime / (range / (86400 * 1000)))
	)}\nweek: ${makeTimeString(Math.round(totalPlaytime / (range / 604800000)))}\nmonth: ${makeTimeString(
		Math.round(totalPlaytime / (range / 2628000000))
	)}\nuser: ${makeTimeString(Math.round(totalPlaytime / games))}\nlog: ${makeTimeString(
		Math.round(totalPlaytime / totalLogs)
	)}`;
	const tmp = db.games.sort((a, b) => b.playtime / b.logs - a.playtime / a.logs)[0];
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
		.setFooter({
			text: `Requested by ${interaction.user.tag}`,
			iconURL: interaction.user.displayAvatarURL({ size: 16 }),
		})
		.setTimestamp(Date.now())
		.addFields(
			{ inline: true, name: "Most logged game", value: mostLogged },
			{ inline: true, name: "Game with most playtime", value: mostPlayed },
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
export async function userLast(interaction: ChatInputCommandInteraction) {
	const target = interaction.options.getUser("user") ? interaction.options.getUser("user") : interaction.user;
	if (!target) {
		await interaction.reply(USERNOTFOUND);
		return;
	}
	const member = await interaction.guild?.members.fetch(target.id);
	if (member == undefined) {
		await interaction.reply(MEMBERNOTFOUND);
		return;
	}
	const db = trackerUsers.get(member.id);
	if (!db) {
		await interaction.reply(USERNOENTRY);
		return;
	}
	const logs = db.lastlogs.reverse();
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
			name: config.botName,
			url: config.githubURL,
			iconURL: config.iconURL,
		})
		.setTitle(`Latest logs by ${member?.displayName}`)
		.addFields(...fields);

	await interaction.reply({ embeds: [embed] });
}
export async function userTop(interaction: ChatInputCommandInteraction) {
	const target = interaction.options.getUser("user") ? interaction.options.getUser("user") : interaction.user;
	if (!target) {
		await interaction.reply(USERNOTFOUND);
		return;
	}
	const member = await interaction.guild?.members.fetch(target.id);
	if (member == undefined) {
		await interaction.reply(MEMBERNOTFOUND);
		return;
	}

	const filter = interaction.options.getString("filter", true);

	let games: TrackerSublog[] | undefined = [];
	if (filter == "logs") {
		games = sortGamesLogs(member.id);
	} else if (filter == "playtime") {
		games = sortGamesPlaytime(member.id);
	} else {
		await interaction.reply(INVALIDFILTER);
		return;
	}

	if (!games) {
		await interaction.reply(USERNOENTRY);
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
			name: config.botName,
			url: config.githubURL,
			iconURL: config.iconURL,
		})
		.setTitle(`Top games (${filter}) by ${member?.displayName}`)
		.addFields(...fields);

	await interaction.reply({ embeds: [embed] });
}
