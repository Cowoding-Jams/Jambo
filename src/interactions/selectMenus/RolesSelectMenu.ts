import { SelectMenu } from "../interactionClasses";
import { inlineCode, StringSelectMenuInteraction } from "discord.js";
import { logger } from "../../logger";

class RoleSelectMenu extends SelectMenu {
	constructor() {
		super("roles");
	}

	async execute(interaction: StringSelectMenuInteraction, customID: string[]): Promise<void> {
		interaction.deferReply({ ephemeral: true });

		if (customID[0] == "timezone") {
			const timezone = interaction.values[0] ?? "None";
			const guildRoles = await interaction.guild?.roles.fetch();
			const member = await interaction.guild?.members.fetch(interaction.user.id);
			const role = guildRoles?.find((r) => r.name === timezone);
			if (!role || !member) {
				await interaction.reply({ content: "Can't find the role or you (the member)...", ephemeral: true });
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
				await interaction.editReply({
					content: `Gave you the **${inlineCode(timezone)}** role.`,
				});
			} else {
				await interaction.editReply({
					content: `Removed your ${currentTimezoneRoles.map((c) => inlineCode(c.name)).join(" ")} role.`,
				});
			}
		}
	}
}

export default new RoleSelectMenu();
