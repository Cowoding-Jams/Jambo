import { EmbedBuilder } from "discord.js";
import { APIEmbedField, ChatInputCommandInteraction } from "discord.js";
import { discordTimestamp } from "../misc/time";
import { trackerGames, trackerLogs, trackerUsers } from "../../db";
import { config } from "../../config";
import { makeTimeString } from "./helper";
import { GAMENOENTRY, USERNOENTRY, USERNOGAMEENTRY } from "./messages";

export async function playtime(interaction: ChatInputCommandInteraction) {
	const targetUser = interaction.options.getUser("user");
	const targetGame = interaction.options.getString("game");
	let text = "";

	if (!targetUser && !targetGame) {
		let playtime = 0;
		trackerGames.array().forEach((game) => (playtime += game.playtime));
		text = `The whole system has tracked ${makeTimeString(playtime)} of playtime`;
	} else if (!targetUser && targetGame) {
		const db = trackerGames.get(targetGame.toLowerCase());
		if (!db) {
			await interaction.reply(GAMENOENTRY);
			return;
		}
		text = `${targetGame} has ${makeTimeString(db.playtime)} of playtime`;
	} else if (targetUser && !targetGame) {
		const db = trackerUsers.get(targetUser.id);
		if (!db) {
			await interaction.reply(USERNOENTRY);
			return;
		}
		text = `${targetUser.username} has ${makeTimeString(db.playtime)} of playtime`;
	} else if (targetUser && targetGame) {
		const db = trackerUsers
			.get(targetUser.id)
			?.games.find((g) => g.id.toLowerCase() == targetGame.toLowerCase());
		if (!db) {
			await interaction.reply(USERNOGAMEENTRY);
			return;
		}
		text = `${targetUser.username} has ${makeTimeString(db.playtime)} of playtime in ${targetGame}`;
	} else {
		return;
	}

	await interaction.reply({
		embeds: [new EmbedBuilder().setTitle(text).setColor(config.color)],
	});
}
export async function logs(interaction: ChatInputCommandInteraction) {
	const targetUser = interaction.options.getUser("user");
	const targetGame = interaction.options.getString("game");
	let text = "";

	if (!targetUser && !targetGame) {
		let logs = 0;
		trackerGames.array().forEach((game) => (logs += game.logs));
		text = `The whole system has tracked ${logs} times`;
	} else if (!targetUser && targetGame) {
		const db = trackerGames.get(targetGame.toLowerCase());
		if (!db) {
			await interaction.reply(GAMENOENTRY);
			return;
		}
		text = `${targetGame} was played ${db.logs} times`;
	} else if (targetUser && !targetGame) {
		const db = trackerUsers.get(targetUser.id);
		if (!db) {
			await interaction.reply(USERNOENTRY);
			return;
		}
		text = `${targetUser.username} was logged ${db.logs} times`;
	} else if (targetUser && targetGame) {
		const db = trackerUsers
			.get(targetUser.id)
			?.games.find((g) => g.id.toLowerCase() == targetGame.toLowerCase());
		if (!db) {
			await interaction.reply(USERNOGAMEENTRY);
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
	const fields: APIEmbedField[] = [];

	const logs = trackerLogs.array().slice(0, 5).reverse();
	logs.forEach((log) =>
		fields.push({
			inline: true,
			name: log.gameName,
			value: `user: <@${log.userid}>\ntime: <t:${Math.floor(
				new Date(log.time).getTime() / 1000
			)}:d><t:${Math.floor(new Date(log.time).getTime() / 1000)}:t>\nplayed time: ${makeTimeString(
				log.playtime
			)}`,
		})
	);

	fields.push({ inline: true, name: "_ _", value: "_ _" });

	const embed = new EmbedBuilder()
		.setTitle("Latest logs")
		.setColor(config.color)
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
		.setColor(config.color)
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
