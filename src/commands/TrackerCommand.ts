import {
	ChatInputCommandInteraction,
	EmbedBuilder,
	EmbedField,
	SlashCommandBuilder,
	SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";
import { Command } from "../interactions/interactionClasses";
import { hasAdminPerms } from "../util/misc/permissions";
import { addDefaultEmbedFooter } from "../util/misc/embeds";
import { activityTrackerBlacklistDb, activityTrackerLogDb } from "../db";
import { config } from "../config";

class TrackerCommand extends Command {
	constructor() {
		super("tracker");
	}

	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		const group: string | null = interaction.options.getSubcommandGroup();
		const sub: string | null = interaction.options.getSubcommand();

		if (group === "blacklist") {
			if (sub === "add") {
				await blacklistAdd(interaction);
			} else if (sub === "remove") {
				await blacklistRemove(interaction);
			} else if (sub === "show") {
				await blacklistShow(interaction);
			}
		} else if (group === "statistics") {
			if (sub === "mystats") {
				await statisticsMystats(interaction);
			} else if (sub === "gamestats") {
				await statisticsGamestats(interaction);
			} else if (sub === "allstats") {
				await statisticsAllstats(interaction);
			}
		} else if (group === "admin") {
			if (!hasAdminPerms(interaction)) {
				return;
			} else if (sub === "reset") {
				await adminReset(interaction);
			} else if (sub === "blacklistgame") {
				await adminBlacklistgame(interaction);
			} else if (sub === "whitelistgame") {
				await adminWhitelistgame(interaction);
			} else if (sub === "look") {
				await adminLook(interaction);
			} else if (sub == "show") {
				await adminShow(interaction);
			}
		} else if (sub === "disabled") {
			await interaction.reply({
				content:
					"Activity Logging is Disabled for this bot.\nIf it gets activated again you can find more commands which start with `/tracker`",
				ephemeral: true,
			});
		}
	}

	register():
		| SlashCommandBuilder
		| SlashCommandSubcommandsOnlyBuilder
		| Omit<SlashCommandBuilder, "addSubcommandGroup" | "addSubcommand"> {
		if (!config.logActivity) {
			return new SlashCommandBuilder()
				.setName("tracker")
				.setDescription("Tracking is disabled")
				.addSubcommand((sub) => sub.setName("disabled").setDescription("Tracking is disabled"));
		}
		return new SlashCommandBuilder()
			.setName("tracker")
			.setDescription("All commands associated with the Game activity tracker!")
			.addSubcommandGroup((group) =>
				group
					.setName("blacklist")
					.setDescription("Tracking blacklist")
					.addSubcommand((sub) =>
						sub
							.setName("add")
							.setDescription("add a game to your blacklist")
							.addStringOption((opt) =>
								opt
									.setName("game")
									.setDescription("Enter game or dont enter anything to disable your logging")
							)
					)
					.addSubcommand((sub) =>
						sub
							.setName("remove")
							.setDescription("remove a game from your blacklist")
							.addStringOption((opt) =>
								opt
									.setName("game")
									.setDescription("Enter game or dont enter anything to enable your logging")
									.setAutocomplete(true)
									.setRequired(true)
							)
					)
					.addSubcommand((sub) => sub.setName("show").setDescription("See what is on your blacklist"))
			)
			.addSubcommandGroup((group) =>
				group
					.setName("statistics")
					.setDescription("Show statistics")
					.addSubcommand((sub) =>
						sub
							.setName("mystats")
							.setDescription("Show your activity statistics")
							.addStringOption((opt) =>
								opt
									.setName("game")
									.setDescription("Show statistics for a specific game")
									.setAutocomplete(true)
							)
					)
					.addSubcommand((sub) =>
						sub
							.setName("gamestats")
							.setDescription("Show statistics for a specific game across all users")
							.addStringOption((opt) =>
								opt
									.setName("game")
									.setDescription("Show statistics for a specific game")
									.setAutocomplete(true)
									.setRequired(true)
							)
					)
					.addSubcommand((sub) =>
						sub.setName("allstats").setDescription("Show statistics about all games across all users")
					)
			)
			.addSubcommandGroup((group) =>
				group
					.setName("admin")
					.setDescription("admin only commands")
					.addSubcommand((sub) =>
						sub
							.setName("reset")
							.setDescription("Reset every log and blacklist entry")
							.addBooleanOption((opt) =>
								opt.setName("sure").setDescription("Are you really sure?").setRequired(true)
							)
							.addStringOption((opt) =>
								opt
									.setName("really")
									.setDescription("Are you really sure you want to delete every entry?")
									.addChoices(
										{ name: "No. I dont want to delete every log and blacklist entry!", value: "no" },
										{ name: "Yes I am sure. I want to delete every log and blacklist entry!", value: "yes" }
									)
									.setRequired(true)
							)
					)
					.addSubcommand((sub) =>
						sub
							.setName("blacklistgame")
							.setDescription("Blacklist a game for all users.")
							.addStringOption((opt) =>
								opt
									.setName("game")
									.setDescription("The game which should get blacklisted globaly")
									.setRequired(true)
							)
					)
					.addSubcommand((sub) =>
						sub
							.setName("whitelistgame")
							.setDescription("Remove a game from the global blacklist")
							.addStringOption((opt) =>
								opt
									.setName("game")
									.setDescription("The game which should get removed from the global blacklist")
									.setRequired(true)
									.setAutocomplete(true)
							)
					)
					.addSubcommand((sub) =>
						sub
							.setName("look")
							.setDescription("take a look into the blacklist of someone else")
							.addUserOption((opt) =>
								opt
									.setName("user")
									.setDescription("the user of whos blacklist should get shown")
									.setRequired(true)
							)
					)
					.addSubcommand((sub) => sub.setName("show").setDescription("Show global blacklist"))
			);
	}
}
export default new TrackerCommand();

// commands

async function blacklistAdd(interaction: ChatInputCommandInteraction): Promise<void> {
	const game = interaction.options.getString("game", false);
	if (game == null) {
		activityTrackerBlacklistDb.push("general-user", interaction.user.id);
		let embed = new EmbedBuilder()
			.setTitle("Your game activity wont get logged anymore")
			.setDescription(
				"Tracking is now disabled for you. To activate it again use `/tracking blacklist remove`"
			);
		embed = addDefaultEmbedFooter(embed);
		await interaction.reply({ embeds: [embed], ephemeral: true });
		return;
	}

	if (!activityTrackerBlacklistDb.has(interaction.user.id)) {
		activityTrackerBlacklistDb.set(interaction.user.id, []);
	}
	activityTrackerBlacklistDb.push(interaction.user.id, game);

	let embed = new EmbedBuilder().setTitle(`"${game}" is now on your blacklist`);

	embed = addDefaultEmbedFooter(embed);
	await interaction.reply({ embeds: [embed], ephemeral: true });
}

async function blacklistRemove(interaction: ChatInputCommandInteraction): Promise<void> {
	const game = interaction.options.getString("game", true);

	if (game === "Tracking is disabled, select this to activate it again") {
		let blacklistedUser = activityTrackerBlacklistDb.get("general-user");
		if (!blacklistedUser) {
			let embed = new EmbedBuilder().setTitle("Something went wrong");
			embed = addDefaultEmbedFooter(embed);
			await interaction.reply({ embeds: [embed], ephemeral: true });
			return;
		}

		blacklistedUser = blacklistedUser.filter((e) => e !== interaction.user.id);

		activityTrackerBlacklistDb.set("general-user", blacklistedUser);

		let embed = new EmbedBuilder().setTitle("Your tracking is activated again!");
		embed = addDefaultEmbedFooter(embed);
		interaction.reply({ embeds: [embed], ephemeral: true });
		return;
	}

	let blacklistedGames: string[] | undefined = activityTrackerBlacklistDb.get(interaction.user.id);

	if (!blacklistedGames) {
		let embed = new EmbedBuilder().setTitle("Something went wrong");
		embed = addDefaultEmbedFooter(embed);
		await interaction.reply({ embeds: [embed], ephemeral: true });
		return;
	}

	blacklistedGames = blacklistedGames?.filter((e) => e !== game);

	activityTrackerBlacklistDb.set(interaction.user.id, blacklistedGames);

	let embed = new EmbedBuilder().setTitle(`"${game}" is now removed from the blacklist`);
	embed = addDefaultEmbedFooter(embed);
	await interaction.reply({ embeds: [embed], ephemeral: true });
}

async function blacklistShow(interaction: ChatInputCommandInteraction): Promise<void> {
	const blacklist = await getBlacklist(interaction.user.id);

	if (blacklist?.length == 0 || blacklist == undefined) {
		let embed = new EmbedBuilder()
			.setTitle("Your Blacklist")
			.setDescription(
				"Tracking status: `" +
					(activityTrackerBlacklistDb.get("general-user")?.includes(interaction.user.id)
						? "disabled"
						: "enabled") +
					"`\nBlacklisted games: No game is blacklisted. Every game gets logged"
			);

		embed = addDefaultEmbedFooter(embed);
		await interaction.reply({ embeds: [embed], ephemeral: true });
		return;
	}

	const str = "`" + blacklist.join("`, `") + "`";

	let embed = new EmbedBuilder()
		.setTitle("Your blacklist")
		.setDescription(
			"Trackstatus: `" +
				(activityTrackerBlacklistDb.get("general-user")?.includes(interaction.user.id)
					? "disabled"
					: "enabled") +
				"`\nBlacklisted games: " +
				str
		);
	embed = addDefaultEmbedFooter(embed);

	await interaction.reply({ embeds: [embed], ephemeral: true });
}

async function statisticsMystats(interaction: ChatInputCommandInteraction): Promise<void> {
	const game = interaction.options.getString("game")?.toLowerCase();
	const fields = await makeStats(await getEntrys(interaction.user.id, game));

	if (fields.length == 0) {
		let embed = new EmbedBuilder().setTitle(game === null ? "No logs found" : `No logs found for ${game}`);
		embed = addDefaultEmbedFooter(embed);
		await interaction.reply({ embeds: [embed] });
		return;
	}

	if (game === null) {
		const allEntrys = activityTrackerLogDb.keyArray();
		const games = allEntrys.filter((e) => e.split("-")[0] === interaction.user.id).length;

		let embed = new EmbedBuilder()
			.setTitle("Your stats across all games")
			.addFields(fields)
			.addFields({ name: "Games", value: `${games} unique games`, inline: true });
		embed = addDefaultEmbedFooter(embed);
		await interaction.reply({ embeds: [embed] });
		return;
	}

	let embed = new EmbedBuilder().setTitle(`Your stats about ${game}`).addFields(fields);
	embed = addDefaultEmbedFooter(embed);
	await interaction.reply({ embeds: [embed] });
}

async function statisticsGamestats(interaction: ChatInputCommandInteraction): Promise<void> {
	const game = interaction.options.getString("game", true).toLowerCase();
	const fields = await makeStats(await getEntrys(undefined, game));

	if (fields.length == 0) {
		let embed = new EmbedBuilder().setTitle(`No logs found for ${game}`);
		embed = addDefaultEmbedFooter(embed);
		await interaction.reply({ embeds: [embed] });
		return;
	}

	const allEntrys = activityTrackerLogDb.keyArray();
	const users: string[] = [];
	allEntrys.forEach((e) => {
		if (e.split("-")[1].toLowerCase() === game && !users.includes(e)) users.push(e);
	});

	if (users.length === 0) {
		let embed = new EmbedBuilder().setTitle("No records found");
		embed = addDefaultEmbedFooter(embed);
		await interaction.reply({ embeds: [embed] });
		return;
	}

	let embed = new EmbedBuilder()
		.setTitle(`Stats across all users for ${game}`)
		.addFields(fields)
		.addFields({ name: "Users", value: `${users.length} unique users`, inline: true });
	embed = addDefaultEmbedFooter(embed);
	await interaction.reply({ embeds: [embed] });
	return;
}

async function statisticsAllstats(interaction: ChatInputCommandInteraction): Promise<void> {
	const fields = await makeStats(await getEntrys(undefined, undefined));

	if (fields.length == 0) {
		let embed = new EmbedBuilder().setTitle("No logs found");
		embed = addDefaultEmbedFooter(embed);
		await interaction.reply({ embeds: [embed] });
		return;
	}

	const allEntrys = activityTrackerLogDb.keyArray();
	const users: string[] = [];
	const games: string[] = [];
	allEntrys.forEach((e) => {
		const split = e.split("-");
		const user = split[0];
		const game = split[1];
		if (!users.includes(user)) users.push(user);
		if (!games.includes(game)) games.push(game);
	});

	let embed = new EmbedBuilder()
		.setTitle("Stats across all users and games")
		.addFields(fields)
		.addFields(
			{ name: "Users", value: `${users.length} unique users`, inline: true },
			{ name: "Games", value: `${games.length} unique games`, inline: true }
		);

	embed = addDefaultEmbedFooter(embed);
	await interaction.reply({ embeds: [embed] });
}

async function adminReset(interaction: ChatInputCommandInteraction): Promise<void> {
	const sure: boolean = interaction.options.getBoolean("sure", true);
	const really: string = interaction.options.getString("really", true);

	if (!(sure && really == "yes")) {
		let embed = new EmbedBuilder()
			.setTitle("Seams like your are not really sure.")
			.setDescription(
				"Because you are not really sure if you should reset everything related to Tracking, the reset wasnt executed."
			)
			.setColor("#9d4b4b");
		embed = addDefaultEmbedFooter(embed);
		await interaction.reply({ embeds: [embed] });
		return;
	} else {
		let embed = new EmbedBuilder().setTitle("Reseting Logs and Blacklist...").setColor("#9d9e4c");
		embed = addDefaultEmbedFooter(embed);
		await interaction.reply({ embeds: [embed] });
	}

	activityTrackerLogDb.clear();
	activityTrackerBlacklistDb.clear();
	activityTrackerBlacklistDb.ensure("general-user", []);
	activityTrackerBlacklistDb.ensure("general-game", []);

	let embed = new EmbedBuilder().setTitle("Reset done!").setColor("#4c9e4f");
	embed = addDefaultEmbedFooter(embed);
	await interaction.editReply({ embeds: [embed] });
}

async function adminBlacklistgame(interaction: ChatInputCommandInteraction): Promise<void> {
	const game = interaction.options.getString("game", true);
	activityTrackerBlacklistDb.push("general-game", game);

	let embed = new EmbedBuilder()
		.setTitle("added a game to blacklist")
		.setDescription(`No activity about "${game}" will be logged anymore.`);
	embed = addDefaultEmbedFooter(embed);
	await interaction.reply({ embeds: [embed] });
}

async function adminWhitelistgame(interaction: ChatInputCommandInteraction): Promise<void> {
	const game = interaction.options.getString("game", true);

	if (game == "Global blacklist is empty") {
		let embed = new EmbedBuilder().setTitle("Global blacklist is empty");

		embed = addDefaultEmbedFooter(embed);
		interaction.reply({ embeds: [embed], ephemeral: true });
	}

	let blacklistedGames: string[] | undefined = activityTrackerBlacklistDb.get("general-game");

	if (!blacklistedGames) {
		let embed = new EmbedBuilder().setTitle("Something went wrong");
		embed = addDefaultEmbedFooter(embed);
		await interaction.reply({ embeds: [embed] });
		return;
	}

	blacklistedGames = blacklistedGames?.filter((e) => e !== game);

	activityTrackerBlacklistDb.set("general-game", blacklistedGames);

	let embed = new EmbedBuilder()
		.setTitle("Removed a game from global blacklist")
		.setDescription(`Removed "${game}" from global blacklist.`);
	embed = addDefaultEmbedFooter(embed);
	await interaction.reply({ embeds: [embed] });
}

async function adminLook(interaction: ChatInputCommandInteraction): Promise<void> {
	const user = interaction.options.getUser("user", true);
	const blacklist = await getBlacklist(user.id);

	if (blacklist?.length == 0 || blacklist == undefined) {
		let embed = new EmbedBuilder()
			.setTitle(`${user.tag}'s Blacklist`)
			.setDescription(
				"Tracking status: `" +
					(activityTrackerBlacklistDb.get("general-user")?.includes(user.id) ? "disabled" : "enabled") +
					"`\nBlacklisted games: No game is blacklisted. Every game gets logged"
			);
		embed = addDefaultEmbedFooter(embed);
		await interaction.reply({ embeds: [embed], ephemeral: true });
		return;
	}

	const str = "`" + blacklist.join("`, `") + "`";

	let embed = new EmbedBuilder()
		.setTitle(`${user.tag}'s Blacklist`)
		.setDescription(
			"Trackstatus: `" +
				(activityTrackerBlacklistDb.get("general-user")?.includes(user.id) ? "disabled" : "enabled") +
				"`\nBlacklisted games: " +
				str
		);
	embed = addDefaultEmbedFooter(embed);
	await interaction.reply({ embeds: [embed], ephemeral: true });
}

async function adminShow(interaction: ChatInputCommandInteraction) {
	const blacklist: string[] | undefined = activityTrackerBlacklistDb.get("general-game");

	if (!blacklist || blacklist.length == 0) {
		let embed = new EmbedBuilder().setTitle("Global Blacklist is empty");
		embed = addDefaultEmbedFooter(embed);
		await interaction.reply({ embeds: [embed] });
		return;
	}

	const str = "`" + blacklist?.join("`, `") + "`";
	let embed = new EmbedBuilder().setTitle("Global Blacklist").setDescription(str);
	embed = addDefaultEmbedFooter(embed);
	await interaction.reply({ embeds: [embed] });
}

// helper functions

async function getBlacklist(userid: string): Promise<string[] | undefined> {
	if (!activityTrackerBlacklistDb.has(userid)) return [];
	return activityTrackerBlacklistDb.get(userid);
}

async function getEntrys(
	user: string | undefined | null,
	game: string | undefined | null
): Promise<string[]> {
	const allEntrys = activityTrackerLogDb.keyArray();
	const found: string[] = [];
	const userCheck: boolean = user == null || user == undefined;
	const gameCheck: boolean = game == null || game == undefined;
	allEntrys.forEach((element) => {
		if (userCheck && gameCheck) {
			const entry = activityTrackerLogDb.get(element);
			if (entry !== undefined) found.push(element);
		} else if (userCheck && !gameCheck) {
			const gameEntry = element.split("-")[1].toLowerCase();
			if (gameEntry !== game) return;
			const entry = activityTrackerLogDb.get(element);
			if (entry !== undefined) found.push(element);
		} else if (!userCheck && gameCheck) {
			const userEntry = element.split("-")[0];
			if (userEntry !== user) return;
			const entry = activityTrackerLogDb.get(element);
			if (entry !== undefined) found.push(element);
		} else if (!userCheck && !gameCheck) {
			const split = element.split("-");
			if (split[0] !== user || split[1].toLowerCase() !== game) return;
			const entry = activityTrackerLogDb.get(element);
			if (entry !== undefined) found.push(element);
		}
	});
	return found;
}

async function makeStats(entrys: string[]): Promise<Array<EmbedField>> {
	if (entrys.length == 0) {
		return [];
	}

	let firstEntry = Infinity;
	let lastEntry = 0;
	let playTime = 0;
	let longestRecord = 0;
	let totalRecords = 0;

	entrys.forEach((game) => {
		const logs = activityTrackerLogDb.get(game);
		logs?.forEach((log) => {
			totalRecords += 1;
			playTime += log.t;
			if (log.w < firstEntry) firstEntry = log.w;
			if (log.w > lastEntry) lastEntry = log.w;
			if (log.t > longestRecord) longestRecord = log.t;
		});
	});

	let dayDifference = Math.floor(lastEntry / 86400000) - Math.floor(firstEntry / 86400000);
	dayDifference = dayDifference == 0 ? 1 : dayDifference;

	const average = Math.floor(playTime / dayDifference);

	const fields = [
		{ name: "Record Range", value: `${dayDifference} Days`, inline: true },
		{ name: "Total Playtime", value: await makeTimestamp(playTime, true), inline: true },
		{ name: "Playtime/Day", value: await makeTimestamp(average, false), inline: true },
		{
			name: "First Record",
			value: `<t:${Math.floor(firstEntry / 1000)}> ⁘ <t:${Math.floor(firstEntry / 1000)}:R>`,
			inline: true,
		},
		{
			name: "Last Record",
			value: `<t:${Math.floor(lastEntry / 1000)}> ⁘ <t:${Math.floor(lastEntry / 1000)}:R>`,
			inline: true,
		},
		{ name: "Longest Record", value: await makeTimestamp(longestRecord, false), inline: true },
		{ name: "Total Records", value: `${totalRecords}`, inline: true },
	];

	return fields;
}

async function makeTimestamp(ms: number, day: boolean): Promise<string> {
	let totalSeconds = ms / 1000;
	const days = Math.floor(totalSeconds / 86400);
	totalSeconds %= 86400;
	const hours = Math.floor(totalSeconds / 3600);
	totalSeconds %= 3600;
	const minute = Math.floor(totalSeconds / 60);
	const second = Math.floor(totalSeconds % 60);

	return `${days > 0 && day ? days + "day(s)" : ""}${hours > 0 ? hours + " hour(s)" : ""}${
		hours > 0 && minute > 0 ? ", " : " "
	}${minute > 0 ? minute + " minute(s)" : ""}${(hours > 0 || minute > 0) && second > 0 ? " and " : ""} ${
		second > 0 ? second + " second(s)" : ""
	}`;
}
