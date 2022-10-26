import { SelectMenu } from "../interactionClasses";
import { inlineCode, SelectMenuInteraction } from "discord.js";
import { logger } from "../../logger";

class RoleSelectMenu extends SelectMenu {
	constructor() {
		super("role");
	}

	async execute(interaction: SelectMenuInteraction, subcommand: string[]): Promise<void> {
		if (subcommand[0] == "timezone") {
			const timezone = interaction.values[0] ?? "None";
			const guildRoles = await interaction.guild?.roles.fetch();
			const member = await interaction.guild?.members.fetch(interaction.user.id);
			const role = guildRoles?.find((r) => r.name === timezone);
			if (!role || !member) {
				await interaction.reply("Can't find the role or you (the member)...");
				logger.warn("Couldn't find a role or member. Probably is an old prompt still open.");
				logger.error(role);
				logger.error(member);
				return;
			}

			const currentTimezoneRoles = member.roles.cache.filter((r) => r.name.startsWith("UTC"));

			for (const currentRole of currentTimezoneRoles) {
				await member.roles.remove(currentRole);
			}

			if (role) {
				await member.roles.add(role);
				await interaction.reply({ content: `Gave you the ${inlineCode(timezone)} role.`, ephemeral: true });
			} else {
				await interaction.reply({
					content: `Removed your ${currentTimezoneRoles.map((c) => inlineCode(c.name)).join(" ")} role.`,
					ephemeral: true,
				});
			}
		}
	}
}

export default new RoleSelectMenu();
