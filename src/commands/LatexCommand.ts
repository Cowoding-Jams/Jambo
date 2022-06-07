import { Command } from "../Command";
import { CommandInteraction, MessageActionRow, MessageButton } from "discord.js";
import { SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from "@discordjs/builders";
import { unknownSubcommandEdit } from "../util/unknownSubcommand";
import { latexEquation, latexMixed } from "../util/latexCommand/latexRendering";
import { latexDb } from "../db";

class Latex extends Command {
	constructor() {
		super("latex");
	}

	async execute(interaction: CommandInteraction): Promise<void> {
		await interaction.deferReply();

		const id = (await interaction.fetchReply()).id;

		const subcommand = interaction.options.getSubcommand();
		const input = interaction.options.getString("input", true);

		await latexDb.set(id, input);

		let urlToFile: string | null;
		if (subcommand === "equation") {
			urlToFile = await latexEquation(input);
			this.answerWithImage(interaction, urlToFile);
		} else if (subcommand === "inline") {
			urlToFile = await latexMixed(input);
			this.answerWithImage(interaction, urlToFile);
		} else {
			unknownSubcommandEdit(interaction);
		}
	}

	answerWithImage(interaction: CommandInteraction, urlToFile: string | null = null): void {
		const row = new MessageActionRow().addComponents(
			new MessageButton().setCustomId("latex.delete").setLabel("Retry/Delete").setStyle("SECONDARY").setEmoji("🔁")
		);

		if (urlToFile === null) {
			interaction.editReply({ content: "LaTeX compiling error...\nPlease double check your code.", components: [row] });
		} else {
			interaction.editReply({ files: [urlToFile], components: [row] });
		}
	}

	register(): SlashCommandSubcommandsOnlyBuilder {
		return new SlashCommandBuilder()
			.setName("latex")
			.setDescription("Lets you render beautiful LaTeX equations.")
			.addSubcommand((option) =>
				option
					.setName("equation")
					.setDescription("Lets you render a single LaTeX equation.")
					.addStringOption((option) =>
						option.setName("input").setDescription("Your equation in LaTeX notation.").setRequired(true)
					)
			)
			.addSubcommand((option) =>
				option
					.setName("inline")
					.setDescription(
						"Lets you write mixed LaTeX code with text, inline equations ($x^2$) and block equations ($$x^2$$)."
					)
					.addStringOption((option) =>
						option.setName("input").setDescription("Your LaTeX input to render.").setRequired(true)
					)
			);
	}
}

export default new Latex();
