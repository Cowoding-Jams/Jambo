import { Command } from "../handler";
import { ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from "discord.js";
import { hasAdminPerms } from "../util/permissions";
import { colorPrompt, deleteAllRoles, pronounPrompt } from "../util/roleUtil";

class RoleCommand extends Command {
	constructor() {
		super("roles");
	}

	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		if (!(await hasAdminPerms(interaction))) {
			// color role commands are only available to admins
			return;
		}

		const subcommand = interaction.options.getSubcommand();

		if (subcommand === "pronoun-prompt") {
			await interaction.deferReply();
			await pronounPrompt(interaction);
		} else if (subcommand === "color-prompt") {
			await interaction.deferReply();
			await colorPrompt(interaction);
		} else if (subcommand === "delete-all") {
			await interaction.deferReply({ ephemeral: true });
			await deleteAllRoles(interaction);
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
			)
			.addSubcommand((option) =>
				option.setName("delete-all").setDescription("Deletes all the generated roles (Using the '- ... -' indicators).")
			);
	}
}

export default new RoleCommand();
