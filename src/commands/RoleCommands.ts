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

			const canvas = createCanvas(10, 20 + actionRows.length * 25);
			const ctx = canvas.getContext("2d");
			ctx.font = "sans-serif bold 20px";

			const canvasWidth: number =
				actionRows.reduce(
					(a, c) =>
						Math.max(
							a,
							ctx.measureText(
								c.components
									.map((b) => b.data.label?.trim())
									.join("  ")
									.trim()
							).width
						),
					0
				) + 20;

			canvas.width = canvasWidth;
			ctx.font = "sans-serif bold 20px";

			for (let i = 0; i < actionRows.length; i++) {
				let x = 10;
				for (let j = 0; j < actionRows[i].components.length; j++) {
					const [colorName, color] = config.colorRoles[i * 5 + j];
					ctx.fillStyle = color as string; // d.js ColorResolvable not compatible with canvas
					ctx.fillText(colorName, x, 30 + i * 25);
					x += ctx.measureText(colorName).width + ctx.measureText("  ").width;
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
				option.setName("color-prompt").setDescription("Creates the color role prompt to select the roles.")
			);
	}
}

export default new RoleCommand();
