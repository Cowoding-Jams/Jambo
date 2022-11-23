import { Command } from "../interactions/interactionClasses";
import {
	ChatInputCommandInteraction,
	SlashCommandBuilder,
	SlashCommandStringOption,
	SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";
import { hasAdminPerms } from "../util/misc/permissions";
import { deleteJam, editJam, newJam } from "../util/jamCommand/manageJams";
import { deletePoll, editPoll, newPoll } from "../util/pollCommand/managePolls";

class PollCommand extends Command {
	constructor() {
		super("coding-jams");
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

		const subCmdGroup = interaction.options.getSubcommandGroup() || "cmd";
		const subCmd = interaction.options.getSubcommand();

		const commands: {
			[key: string]: { [key: string]: (interaction: ChatInputCommandInteraction) => Promise<void> };
		} = {
			jam: {
				new: newJam,
				edit: editJam,
				delete: deleteJam,
			},
			poll: {
				new: newPoll,
				edit: editPoll,
				delete: deletePoll,
			},
			cmd: {},
		};

		await interaction.deferReply({ ephemeral: true });
		await commands[subCmdGroup][subCmd](interaction);
	}

	register(): SlashCommandSubcommandsOnlyBuilder {
		return new SlashCommandBuilder()
			.setName("coding-jams")
			.setDescription("A full featured system to manage the coding jams. (admins/mods only)")
			.addSubcommandGroup((group) =>
				group
					.setName("poll")
					.setDescription("Manage the polls.")
					.addSubcommand((subcommand) =>
						subcommand
							.setName("new")
							.setDescription("Create a new poll.")
							.addStringOption(pollNameStringOption)
					)
					.addSubcommand((subcommand) =>
						subcommand
							.setName("edit")
							.setDescription("Edit an existing poll.")
							.addStringOption(pollNameStringOption)
					)
					.addSubcommand((subcommand) =>
						subcommand
							.setName("delete")
							.setDescription("Delete an existing poll.")
							.addStringOption(pollNameStringOption)
					)
			)
			.addSubcommandGroup((group) =>
				group
					.setName("jam")
					.setDescription("Manage the jams.")
					.addSubcommand((subcommand) =>
						subcommand.setName("new").setDescription("Create a new jam.").addStringOption(jamNameStringOption)
					)
					.addSubcommand((subcommand) =>
						subcommand
							.setName("edit")
							.setDescription("Edit an existing jam.")
							.addStringOption(jamNameStringOption)
					)
					.addSubcommand((subcommand) =>
						subcommand
							.setName("delete")
							.setDescription("Delete an existing jam.")
							.addStringOption(jamNameStringOption)
					)
			)
			.addSubcommandGroup((group) =>
				group
					.setName("list")
					.setDescription("List existing polls or jams.")
					.addSubcommand((subcommand) => subcommand.setName("jams").setDescription("Lists all the jams."))
					.addSubcommand((subcommand) => subcommand.setName("polls").setDescription("Lists all the polls."))
			);
	}
}

export default new PollCommand();

const pollNameStringOption = (option: SlashCommandStringOption) =>
	option.setName("name").setDescription("The name of the poll.").setRequired(true);

const jamNameStringOption = (option: SlashCommandStringOption) =>
	option.setName("name").setDescription("The name of the jam.").setRequired(true);
