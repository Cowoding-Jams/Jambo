import { ChatInputCommandInteraction } from "discord.js";
import { trackerBlacklist } from "../../db";
import { hasAdminPerms } from "../misc/permissions";
import { ADMINONLY, GAMEADDED, GAMENOTBLACKLIST, GAMEONBLACKLIST, GAMEREMOVED } from "./messages";

export async function addBlacklist(interaction: ChatInputCommandInteraction) {
	if (!(await hasAdminPerms(interaction))) {
		interaction.reply(ADMINONLY);
		return;
	}

	const game = interaction.options.getString("game", true);
	if (trackerBlacklist.get("")?.find((g) => g.toLowerCase() == game.toLowerCase())) {
		interaction.reply(GAMEONBLACKLIST);
		return;
	}
	trackerBlacklist.push("", game.toLowerCase());
	interaction.reply(GAMEADDED(game));
}
export async function remBlacklist(interaction: ChatInputCommandInteraction) {
	if (!(await hasAdminPerms(interaction))) {
		interaction.reply(ADMINONLY);
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
		interaction.reply(GAMEREMOVED(game));
		return;
	}
	interaction.reply(GAMENOTBLACKLIST);
}
