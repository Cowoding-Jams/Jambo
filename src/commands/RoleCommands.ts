import { Command } from "../Command";
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ChatInputCommandInteraction,
	EmbedBuilder,
	SlashCommandBuilder,
	SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";
import { addDefaultEmbedFooter } from "../util/embeds";
import { config } from "../config";

class RoleCommand extends Command {
	constructor() {
		super("roles");
	}

	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		const subcommand = interaction.options.getSubcommand();

		if (subcommand === "pronoun-prompt") {
			const prompt: EmbedBuilder = new EmbedBuilder()
				.setTitle("Pronoun roles 🌈🏳‍⚧️⚧️")
				.setDescription("Select the pronouns you want others to use when referring to you :)");
			const actionRows: ActionRowBuilder<ButtonBuilder>[] = [];

			for (let i = 0; i < Math.ceil(config.pronounRoles.length / 3); i++) {
				actionRows.push(new ActionRowBuilder());
				for (let j = 0; j < 3; j++) {
					const pronoun = config.pronounRoles[i * 3 + j];
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

			interaction.reply({ embeds: [addDefaultEmbedFooter(prompt)], components: actionRows });
		} else if (subcommand === "color-prompt") {
			const prompt: EmbedBuilder = new EmbedBuilder()
				.setTitle("Color roles 🌈")
				.setDescription("Select the color you want your nickname to have :)");
			const actionRows: ActionRowBuilder<ButtonBuilder>[] = [];

			for (let i = 0; i < Math.ceil(config.colorRoles.length / 5); i++) {
				actionRows.push(new ActionRowBuilder());
				for (let j = 0; j < 3; j++) {
					const color = config.colorRoles[i * 3 + j];
					actionRows[i].addComponents(
						new ButtonBuilder().setCustomId(`role.${color[0]}`).setLabel(color[0]).setStyle(ButtonStyle.Secondary)
					);
				}
			}

			interaction.reply({ embeds: [addDefaultEmbedFooter(prompt)], components: actionRows });
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
