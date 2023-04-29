import { ChatInputCommandInteraction } from "discord.js";
import { trackerBlacklist } from "../../db";
import { hasAdminPerms } from "../misc/permissions";
import {
	adminOnly,
	gameNotOnBlacklist,
	gameOnBlacklist,
	makeGameAddedMessage,
	makeGameRemovedMessage,
} from "./messages";

export async function addBlacklist(interaction: ChatInputCommandInteraction) {
	// check for admin permissions
	if (!(await hasAdminPerms(interaction))) {
		interaction.reply(adminOnly);
		return;
	}

	// get game option
	const game = interaction.options.getString("game", true);
	// check if game is already on blacklist
	if (trackerBlacklist.get("")?.find((g) => g.toLowerCase() == game.toLowerCase())) {
		interaction.reply(gameOnBlacklist);
		return;
	}
	// add game to blacklist
	trackerBlacklist.push("", game.toLowerCase());
	interaction.reply(makeGameAddedMessage(game));
}
export async function remBlacklist(interaction: ChatInputCommandInteraction) {
	// check for admin permissions
	if (!(await hasAdminPerms(interaction))) {
		interaction.reply(adminOnly);
		return;
	}

	// get game option
	const game = interaction.options.getString("game", true);
	const db = trackerBlacklist.get("");
	if (!db) return; // make ts happy...
	if (db?.find((g) => g.toLowerCase() == game.toLowerCase())) {
		// remove game
		trackerBlacklist.set(
			"",
			db.filter((g) => g.toLowerCase() != game.toLowerCase())
		);
		interaction.reply(makeGameRemovedMessage(game));
		return;
	}
	// send error
	interaction.reply(gameNotOnBlacklist);
}
