import { Command } from "../interactions/interactionClasses";
import {
	ChatInputCommandInteraction,
	SlashCommandBuilder,
	SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";
import { hasAdminPerms } from "../util/misc/permissions";
import { colorPrompt, pronounPrompt, timezonePrompt } from "../util/roleCommand/rolePrompts";
import { deleteRoles } from "../util/roleCommand/roleUtil";

class RoleCommand extends Command {
	constructor() {
		super("roles");
	}

	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		if (!(await hasAdminPerms(interaction))) {
			// color role commands are only available to admins
			await interaction.reply({
				content: "You don't have the admin permission to use that command.",
				ephemeral: true,
			});
			return;
		}

		const subcommand = interaction.options.getSubcommand();

		if (subcommand === "pronoun-prompt") {
			await interaction.deferReply();
			await pronounPrompt(interaction);
		} else if (subcommand === "color-prompt") {
			await interaction.deferReply();
			await colorPrompt(interaction);
		} else if (subcommand === "timezone-prompt") {
			await interaction.deleteReply();
			await timezonePrompt(interaction);
		} else if (subcommand === "delete") {
			await interaction.deferReply({ ephemeral: true });
			await deleteRoles(interaction);
		}
	}

	register(): SlashCommandSubcommandsOnlyBuilder {
		return new SlashCommandBuilder()
			.setName("roles")
			.setDescription("Manages the roles on the server.")
			.addSubcommand((option) =>
				option
					.setName("pronoun-prompt")
					.setDescription("Creates the pronoun role prompt to select the roles.")
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
				option.setName("timezone-prompt").setDescription("Creates the timezone role prompt.")
			)
			.addSubcommand((option) =>
				option
					.setName("delete")
					.setDescription("Deletes generated roles.")
					.addBooleanOption((option) =>
						option
							.setName("all")
							.setDescription("Delete all generated roles. (Using the '- ... -' indicators)")
							.setRequired(true)
					)
					.addRoleOption((option) =>
						option
							.setName("start")
							.setDescription("Delete all roles between start and end and starting with this role.")
							.setRequired(false)
					)
					.addRoleOption((option) =>
						option
							.setName("end")
							.setDescription("Delete all roles between start and end and ending with this role.")
							.setRequired(false)
					)
			);
	}
}

export default new RoleCommand();
