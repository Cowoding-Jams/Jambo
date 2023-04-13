import { APIEmbedField, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { config } from "../../config";
import { trackerGames, trackerLogs } from "../../db";
import { discordTimestamp } from "../misc/time";
import { makeTimeString } from "./helper";
import { GAMENOENTRY, INVALIDFILTER } from "./messages";

export async function gameStats(interaction: ChatInputCommandInteraction) {
	const game = interaction.options.getString("game", true);
	const db = trackerGames.get(game.toLocaleLowerCase());
	if (!db) {
		await interaction.reply(GAMENOENTRY);
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
			name: config.botName,
			url: config.githubURL,
			iconURL: config.iconURL,
		})
		.setColor(config.color)
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
		await interaction.reply(GAMENOENTRY);
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
		.setColor(config.color)
		.setAuthor({
			name: config.botName,
			url: config.githubURL,
			iconURL: config.iconURL,
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
	const db = trackerGames.get(target);
	if (!db) {
		await interaction.reply(GAMENOENTRY);
		return;
	}

	const filter = interaction.options.getString("filter", true);
	if (filter == "playtime") {
		("");
	} else if (filter == "logs") {
		("");
	} else {
		interaction.reply(INVALIDFILTER);
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
	config.botName;
	const embed = new EmbedBuilder()
		.setColor(config.color)
		.setAuthor({
			name: config.botName,
			url: config.githubURL,
			iconURL: config.iconURL,
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
