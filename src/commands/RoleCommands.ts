<<<<<<< HEAD:src/commands/RoleCommands.ts
import { Command } from "../handler";
import { ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from "discord.js";
import { hasAdminPerms } from "../util/permissions";
import { colorPrompt, pronounPrompt } from "../util/roleUtil";
=======
import { Command } from "../interactionClasses";
import {
	ChatInputCommandInteraction,
	SlashCommandBuilder,
	SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";
import { hasAdminPerms } from "../util/misc/permissions";
import { colorPrompt, pronounPrompt } from "../util/roleCommand/role";
>>>>>>> ae3e1f7 (init):src/commands/RoleCommand.ts

class RoleCommand extends Command {
	constructor() {
		super("roles");
	}

	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		if (!(await hasAdminPerms(interaction))) {
			// color promps are only available to admins
			return;
		}

		await interaction.deferReply();
		const subcommand = interaction.options.getSubcommand();

		if (subcommand === "pronoun-prompt") {
			await pronounPrompt(interaction);
		} else if (subcommand === "color-prompt") {
			await colorPrompt(interaction);
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
