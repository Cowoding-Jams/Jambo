import { ButtonHandler } from "../ButtonHandler";
import { ButtonInteraction, inlineCode } from "discord.js";
import { logger } from "../logger";

class RoleButton extends ButtonHandler {
	constructor() {
		super("role");
	}

	async execute(interaction: ButtonInteraction, args: string[]): Promise<void> {
		const roleName = args[0];
		const guildRoles = await interaction.guild?.roles.fetch();
		const member = await interaction.guild?.members.fetch(interaction.user.id);
		const role = guildRoles?.find((r) => r.name === roleName);
		if (!role || !member) {
			await interaction.reply("Can't find the role or member...");
			logger.error(role);
			logger.error(member);
			return;
		}

		if (member.roles.cache.map((r) => r.name).includes(roleName)) {
			member.roles.remove(role);
			await interaction.reply({ content: `Removed your ${inlineCode(roleName)} role.`, ephemeral: true });
		} else {
			member.roles.add(role);
			await interaction.reply({ content: `Gave you the ${inlineCode(roleName)} role.`, ephemeral: true });
		}
	}
}

export default new RoleButton();
