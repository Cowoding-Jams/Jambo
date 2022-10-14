import { config } from "../../config";
import { logger } from "../../logger";
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ChatInputCommandInteraction,
	EmbedBuilder,
} from "discord.js";
import { addDefaultEmbedFooter } from "../misc/embeds";
import { createCanvas } from "@napi-rs/canvas";
import { bringIntoButtonGrid, setUpRoles } from "./roleUtil";

export async function deleteAllRoles(interaction: ChatInputCommandInteraction): Promise<void> {
	const guildRoles = await interaction.guild?.roles.fetch();
	if (!guildRoles) {
		logger.error("Could not fetch guild roles");
		await interaction.editReply("Couldn't fetch the roles...");
		return;
	}

	const roles = guildRoles.map((r) => r).sort((a, b) => b.position - a.position);
	let deleteRoles = false;

	for (const role of roles) {
		if (role.name.startsWith("-") && role.name.endsWith("-")) {
			deleteRoles = !deleteRoles;
			role.delete();
		} else if (deleteRoles) {
			role.delete();
		}
	}

	await interaction.editReply({ content: "Deleted all roles!" });
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
			"- StartPronounRoles -",
			"- EndPronounRoles -"
		)
	) {
		await interaction.editReply({ embeds: [addDefaultEmbedFooter(prompt)], components: actionRows });
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
				new ButtonBuilder().setCustomId(`role.${role[0]}`).setLabel(role[0]).setStyle(ButtonStyle.Secondary)
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
		.concat(columnWidths.map((w, i, a) => a.slice(0, i + 1).reduce((p, a) => p + a, 0) + textPadding))
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

	if (await setUpRoles(interaction.guild, config.colorRoles, "- StartColorRoles -", "- EndColorRoles -")) {
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
