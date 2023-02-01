import { Command } from "../interactions/interactionClasses";
import {
	ChatInputCommandInteraction,
	SlashCommandBuilder,
	SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";
import { hasAdminPerms } from "../util/misc/permissions";
import { colorPrompt, jamPrompt, pronounPrompt, timezonePrompt } from "../util/roles/rolesPrompts";
import { deleteRoles } from "../util/roles/rolesUtil";

class RoleCommand extends Command {
	constructor() {
		super("roles");
	}

	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		if (!(await hasAdminPerms(interaction))) {
			// color role commands are only available to admins
			await interaction.reply({
				content: "The role prompt commands are meant to be used by admins only.",
				ephemeral: true,
			});
			return;
		}

		const subcommand = interaction.options.getSubcommand();

		if (subcommand === "pronouns") {
			await interaction.deferReply();
			await pronounPrompt(interaction);
		} else if (subcommand === "colors") {
			await interaction.deferReply();
			await colorPrompt(interaction);
		} else if (subcommand === "timezones") {
			await interaction.deferReply();
			await timezonePrompt(interaction);
		} else if (subcommand === "jam") {
			await interaction.deferReply();
			await jamPrompt(interaction);
		} else if (subcommand === "delete") {
			await interaction.deferReply({ ephemeral: true });
			await deleteRoles(interaction);
		}
	}

	register(): SlashCommandSubcommandsOnlyBuilder {
		return new SlashCommandBuilder()
			.setName("roles")
			.setDescription("Manages the roles on the server.")
			.addSubcommandGroup((group) =>
				group
					.setName("prompt")
					.setDescription("To create different kinds of role prompts.")
					.addSubcommand((option) =>
						option.setName("pronouns").setDescription("Creates the pronoun role prompt.")
					)
					.addSubcommand((option) =>
						option
							.setName("colors")
							.setDescription("Creates the color role prompt.")
							.addIntegerOption((option) =>
								option
									.setName("columns")
									.setDescription("The number of columns to use for the color preview. (default: 2)")
									.setRequired(false)
									.setMinValue(1)
									.setMaxValue(4)
							)
					)
					.addSubcommand((option) =>
						option.setName("timezones").setDescription("Creates the timezone role prompt.")
					)
					.addSubcommand((option) => option.setName("jam").setDescription("Creates the jam role prompt."))
			)
			.addSubcommand((option) =>
				option
					.setName("delete")
					.setDescription("Deletes the generated roles.")
					.addBooleanOption((option) =>
						option
							.setName("all")
							.setDescription("Delete all generated roles. (Using the '- ... -' indicators) (default: false)")
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
