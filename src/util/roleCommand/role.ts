import { config } from "../../config";
import { logger } from "../../logger";
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ChatInputCommandInteraction,
	ColorResolvable,
	ComponentEmojiResolvable,
	EmbedBuilder,
	Guild,
} from "discord.js";
import { addDefaultEmbedFooter } from "../misc/embeds";
import { createCanvas } from "@napi-rs/canvas";

export async function setUpRoles(
	guild: Guild | null,
	roles: [string, ColorResolvable][] | [string][],
	startSeparator: string,
	endSeparator: string
): Promise<boolean> {
	const guildRoles = await guild?.roles.fetch();
	if (!guildRoles) {
		return false;
	}

	if (!guildRoles.map((r) => r.name).includes(startSeparator)) {
		await guild?.roles.create({
			name: startSeparator,
			position: 1,
		});
		await guild?.roles.create({
			name: endSeparator,
			position: 1,
		});
	}

	const separatorPos = guildRoles.find((r) => r.name === startSeparator)?.position ?? 2;
	const endSeparatorPos = guildRoles.find((r) => r.name === endSeparator)?.position ?? 1;
	const existingRoles = guildRoles.filter(
		(r) => r.position > endSeparatorPos && r.position < separatorPos
	);

	// Delete roles that are no longer in the config
	for (const role of existingRoles) {
		if (!roles.map((r) => r[0]).includes(role[1].name)) {
			await role[1].delete();
		}
	}

	// Create roles that are in the config but not in the guild
	for (const role of roles) {
		if (!guildRoles.map((r) => r.name).includes(role[0])) {
			await guild?.roles.create({
				name: role[0],
				color: role[1],
				position: endSeparatorPos + 1,
			});
		}
	}

	return true;
}

export async function pronounPrompt(interaction: ChatInputCommandInteraction): Promise<void> {
	const prompt: EmbedBuilder = new EmbedBuilder()
		.setTitle("Pronoun roles 🌈🏳‍⚧️⚧️")
		.setDescription(
			"Select the pronouns you want others to use when referring to you :)\nIf you don't understand why: https://pronouns.org/what-and-why"
		);

	const actionRows: ActionRowBuilder<ButtonBuilder>[] = [];
	const roles = bringIntoButtonGrid(config.pronounRoles);
	for (const row of roles) {
		actionRows.push(new ActionRowBuilder());
		for (const role of row) {
			actionRows[actionRows.length - 1].addComponents(
				new ButtonBuilder()
					.setCustomId(`role.${role[0]}`)
					.setLabel(role[0])
					.setStyle(actionRows.length == 1 ? ButtonStyle.Primary : ButtonStyle.Secondary)
			);
			if (role[1]) {
				actionRows[actionRows.length - 1].components[
					actionRows[actionRows.length - 1].components.length - 1
				].setEmoji(role[1]);
			}
		}
	}

	if (
		await setUpRoles(
			interaction.guild,
			config.pronounRoles.map((r) => [r[0]]),
			"- PronounRoles -",
			"- EndPronounRoles -"
		)
	) {
		await interaction.editReply({
			embeds: [addDefaultEmbedFooter(prompt)],
			components: actionRows,
		});
	} else {
		await interaction.editReply({ content: "Couldn't set up the roles..." });
		logger.error("Failed to set up pronoun roles.");
	}
}

export async function colorPrompt(interaction: ChatInputCommandInteraction): Promise<void> {
	// Embed and Buttons
	const prompt: EmbedBuilder = new EmbedBuilder()
		.setTitle("Color roles 🌈")
		.setDescription("Select the color you want your nickname to have :)")
		.setImage("attachment://roles.png");

	const actionRows: ActionRowBuilder<ButtonBuilder>[] = [];
	const roles = bringIntoButtonGrid(config.colorRoles.map((r) => [r[0]]));
	for (const row of roles) {
		actionRows.push(new ActionRowBuilder());
		for (const role of row) {
			actionRows[actionRows.length - 1].addComponents(
				new ButtonBuilder()
					.setCustomId(`role.${role[0]}`)
					.setLabel(role[0])
					.setStyle(ButtonStyle.Secondary)
			);
		}
	}

	// Image
	const fontSize = 30;
	const textPadding = 10;
	const columns = interaction.options.getInteger("columns") ?? 2;
	const rows = Math.ceil(config.colorRoles.length / columns);
	const colorRoles: string[] = config.colorRoles.map((r) => r[0]);

	const colorRolesByColumn: string[][] = [];
	for (let i = 0; i < columns; i++) {
		colorRolesByColumn.push(colorRoles.slice(i * rows, (i + 1) * rows));
	}

	const canvas = createCanvas(10, rows * (fontSize + 2 * textPadding));
	const ctx = canvas.getContext("2d");
	ctx.font = `sans-serif bold ${fontSize}px`;
	ctx.lineWidth = 4;
	ctx.lineJoin = "round";
	ctx.strokeStyle = "#000000";

	const columnWidths = colorRolesByColumn.map(
		(c) => Math.max(...c.map((r) => ctx.measureText(r).width)) + 2 * textPadding
	);
	const columnOffsets: number[] = [textPadding]
		.concat(
			columnWidths.map((w, i, a) => a.slice(0, i + 1).reduce((p, a) => p + a, 0) + textPadding)
		)
		.slice(0, -1);

	canvas.width = columnWidths.reduce((partialSum, a) => partialSum + a, 0);
	ctx.font = `sans-serif bold ${fontSize}px`;

	for (let c = 0; c < columns; c++) {
		const offset = columnOffsets[c];
		for (let r = 0; r < rows && c * rows + r < colorRoles.length; r++) {
			const [colorName, color] = config.colorRoles[c * rows + r];
			if (typeof color !== "string") throw new Error("We only support strings for this");
			ctx.fillStyle = color;
			const y = fontSize + textPadding + r * (fontSize + 2 * textPadding);
			ctx.strokeText(colorName, offset, y);
			ctx.fillText(colorName, offset, y);
		}
	}

	if (
		await setUpRoles(interaction.guild, config.colorRoles, "- ColorRoles -", "- EndColorRoles -")
	) {
		await interaction.editReply({
			embeds: [addDefaultEmbedFooter(prompt)],
			components: actionRows,
			files: [
				{
					name: "roles.png",
					attachment: canvas.toBuffer("image/png"),
				},
			],
		});
	} else {
		await interaction.editReply({ content: "Couldn't set up the roles..." });
		logger.error("Failed to set up color roles.");
	}
}

function bringIntoButtonGrid(
	roles: [string][] | [string, ComponentEmojiResolvable | null][]
): ([string][] | [string, ComponentEmojiResolvable | null][])[] {
	const n = roles.length;
	const quotients = [n / 5, n / 4, n / 3];

	if (quotients[0] < 1) {
		return [roles];
	} else {
		const diffs = quotients.map((q) => Math.ceil(q) - q);
		const columns = 5 - diffs.indexOf(Math.min(...diffs));
		const rows = Math.ceil(n / columns);
		const output = [];
		for (let i = 0; i < rows; i++) {
			output.push(roles.slice(i * columns, (i + 1) * columns));
		}
		return output;
	}
}
