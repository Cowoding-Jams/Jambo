import { Command } from "../Command";
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ChatInputCommandInteraction,
	ColorResolvable,
	EmbedBuilder,
	Guild,
	SlashCommandBuilder,
	SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";
import { addDefaultEmbedFooter } from "../util/embeds";
import { hasAdminPerms } from "../util/permissions";
import { config } from "../config";
import { logger } from "../logger";
import { createCanvas } from "@napi-rs/canvas";

class RoleCommand extends Command {
	constructor() {
		super("roles");
	}

	async setUpRoles(
		guild: Guild | null,
		roles: [string, ColorResolvable][] | [string][],
		separator: string,
		endSeparator: string
	): Promise<boolean> {
		const guildRoles = await guild?.roles.fetch();
		if (!guildRoles) {
			return false;
		}

		if (!guildRoles.map((r) => r.name).includes(separator)) {
			await guild?.roles.create({
				name: separator,
				position: 1,
			});
			await guild?.roles.create({
				name: endSeparator,
				position: 1,
			});
		}

		const separatorPos = guildRoles.find((r) => r.name === separator)?.position ?? 2;
		const endSeparatorPos = guildRoles.find((r) => r.name === endSeparator)?.position ?? 1;
		const existingRoles = guildRoles.filter((r) => r.position > endSeparatorPos && r.position < separatorPos);

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

	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		if (!(await hasAdminPerms(interaction))) {
			return;
		}

		await interaction.deferReply();
		const subcommand = interaction.options.getSubcommand();

		if (subcommand === "pronoun-prompt") {
			const prompt: EmbedBuilder = new EmbedBuilder()
				.setTitle("Pronoun roles 🌈🏳‍⚧️⚧️")
				.setDescription(
					"Select the pronouns you want others to use when referring to you :)\nIf you don't understand why: https://pronouns.org/what-and-why"
				);
			const actionRows: ActionRowBuilder<ButtonBuilder>[] = [];
			const temp = Math.ceil(config.pronounRoles.length / 5);
			const columns = config.pronounRoles.length < 15 ? 3 : temp;
			const rows = Math.ceil(config.pronounRoles.length / columns);

			for (let i = 0; i < rows; i++) {
				actionRows.push(new ActionRowBuilder());
				for (let j = 0; j < columns && i * columns + j < config.pronounRoles.length; j++) {
					const pronoun = config.pronounRoles[i * columns + j];
					actionRows[i].addComponents(
						new ButtonBuilder()
							.setCustomId(`role.${pronoun[0]}`)
							.setLabel(pronoun[0])
							.setStyle(i == 0 ? ButtonStyle.Primary : ButtonStyle.Secondary)
					);
					if (pronoun[1]) {
						actionRows[i].components[j].setEmoji(pronoun[1]);
					}
				}
			}

			if (
				await this.setUpRoles(
					interaction.guild,
					config.pronounRoles.map((r) => [r[0]]),
					"- PronounRoles -",
					"- EndPronounRoles -"
				)
			) {
				await interaction.editReply({ embeds: [addDefaultEmbedFooter(prompt)], components: actionRows });
			} else {
				await interaction.editReply({ content: "Couldn't set up the roles..." });
				logger.error("Failed to set up pronoun roles.");
			}
		} else if (subcommand === "color-prompt") {
			const prompt: EmbedBuilder = new EmbedBuilder()
				.setTitle("Color roles 🌈")
				.setDescription("Select the color you want your nickname to have :)")
				.setImage("attachment://roles.png");
			const actionRows: ActionRowBuilder<ButtonBuilder>[] = [];

			for (let i = 0; i < Math.ceil(config.colorRoles.length / 5); i++) {
				actionRows.push(new ActionRowBuilder());
				for (let j = 0; j < 5 && i * 5 + j < config.colorRoles.length; j++) {
					const color = config.colorRoles[i * 5 + j];
					actionRows[i].addComponents(
						new ButtonBuilder().setCustomId(`role.${color[0]}`).setLabel(color[0]).setStyle(ButtonStyle.Secondary)
					);
				}
			}

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

			if (await this.setUpRoles(interaction.guild, config.colorRoles, "- ColorRoles -", "- EndColorRoles -")) {
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
	}

	register(): SlashCommandSubcommandsOnlyBuilder {
		return new SlashCommandBuilder()
			.setName("roles")
			.setDescription("Manages the roles on the server.")
			.addSubcommand((option) =>
				option.setName("pronoun-prompt").setDescription("Creates the pronoun role prompt to select the roles.")
			)
			.addSubcommand((option) =>
				option
					.setName("color-prompt")
					.setDescription("Creates the color role prompt to select the roles.")
					.addIntegerOption((option) =>
						option
							.setName("columns")
							.setDescription("The number of columns to use for the color roles. (Default: 2)")
							.setRequired(false)
							.setMinValue(1)
							.setMaxValue(4)
					)
			);
	}
}

export default new RoleCommand();
