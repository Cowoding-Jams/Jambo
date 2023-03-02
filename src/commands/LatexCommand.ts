import { Command } from "../interactions/interactionClasses";
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ChatInputCommandInteraction,
	SlashCommandBooleanOption,
	SlashCommandBuilder,
	SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";
import { unknownSubcommandEdit } from "../util/misc/commands";
import { latexEquation, latexMixed } from "../util/latex/latexRendering";
import { latexDb } from "../db";

class LatexCommand extends Command {
	constructor() {
		super("latex");
	}

	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		await interaction.deferReply();

		const id = (await interaction.fetchReply()).id;

		const subcommand = interaction.options.getSubcommand();
		const input = interaction.options.getString("input", true);
		const transparent = interaction.options.getBoolean("transparent") ?? true;
		const paper = interaction.options.getString("paper-size") ?? "a5";

		await latexDb.set(id, input);

		let urlToFile: string | null;
		if (subcommand === "equation") {
			urlToFile = await latexEquation(input, transparent);
			this.answerWithImage(interaction, urlToFile);
		} else if (subcommand === "mixed") {
			urlToFile = await latexMixed(input, transparent, paper);
			this.answerWithImage(interaction, urlToFile);
		} else {
			unknownSubcommandEdit(interaction);
		}
	}

	answerWithImage(interaction: ChatInputCommandInteraction, urlToFile: string | null = ""): void {
		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder().setCustomId("latex.delete").setStyle(ButtonStyle.Secondary).setEmoji("🔁")
		);

		if (urlToFile === "") {
			interaction.editReply({
				content: "LaTeX compiling error...\nPlease double check your code.",
				components: [row],
			});
		} else if (urlToFile === null) {
			interaction.editReply({
				content:
					"There is a problem with the LaTeX api we are using... So sorry! Go yell at the devs to implement local rending!",
				components: [row],
			});
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
					.setDescription("Lets you render a single LaTeX block equation.")
					.addStringOption((option) =>
						option
							.setName("input")
							.setDescription("Your math input. (Will end up '$$ [here] $$')")
							.setRequired(true)
					)
					.addBooleanOption(transparencyOption)
			)
			.addSubcommand((option) =>
				option
					.setName("mixed")
					.setDescription(
						"Lets you write mixed LaTeX code with text, inline equations ($x^2$) and block equations ($$x^2$$)."
					)
					.addStringOption((option) =>
						option.setName("input").setDescription("Your LaTeX input to render.").setRequired(true)
					)
					.addBooleanOption(transparencyOption)
					.addStringOption((option) =>
						option
							.setName("paper-size")
							.setDescription("Sets the paper size from a few options.")
							.addChoices({ name: "a5", value: "a5" }, { name: "a4", value: "a4" })
					)
			);
	}
}

const transparencyOption = new SlashCommandBooleanOption()
	.setName("transparent")
	.setDescription("Whether or not the image is a png with no background or a jpg with a white background.")
	.setRequired(false);

export default new LatexCommand();
