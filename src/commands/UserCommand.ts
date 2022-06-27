import { Command } from "../Command";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";

const toUnix = (timestamp: number | Date) => {
	if (timestamp instanceof Date) timestamp = timestamp.getTime();
	return Math.floor(timestamp / 1000);
};

class UserCommand extends Command {
	constructor() {
		super("user");
	}

	async execute(interaction: CommandInteraction): Promise<void> {
		const user = interaction.options.getUser("user", true);
		const member = await interaction.guild?.members.fetch(user.id).catch(() => null);
		const embed = new MessageEmbed()
			.setTitle(`${user.tag} ${user.system ? "| system" : user.bot ? "| bot" : ""}`)
			.setThumbnail(user.displayAvatarURL({ dynamic: true }))
			.setDescription(`Ping: ${user.toString()}`);
		if (user.flags?.toArray().length) {
			embed.addField(
				"Badges",
				user.flags
					.toArray()
					.map((v) => v.toLowerCase().replace(/_/g, " "))
					.join(", ")
					.replace(/\b(.)/g, (c) => c.toUpperCase())
			);
		}
		embed.addField("Id", user.id, true);
		embed.addField("Created", `<t:${toUnix(user.createdTimestamp)}> (<t:${toUnix(user.createdTimestamp)}:R>)`);
		embed.setTimestamp();
		if (member) {
			let roles = "‎";
			member.roles.cache.forEach((role) => {
				if (role.id === role.guild.id) return;
				roles += `<@&${role.id}> `;
			});

			const boosting = member.premiumSince
				? `Since <t:${toUnix(member.premiumSince)}> (<t:${toUnix(member.premiumSince)}:R>)`
				: "Not boosting :(";
			if (member.joinedTimestamp)
				embed.addField(
					"Joined",
					`<t:${toUnix(member.joinedTimestamp)}>\n(<t:${toUnix(member.joinedTimestamp)}:R>)`,
					true
				);
			embed.addField("Boosting", boosting, true).addField("Roles", roles);
		}
		await interaction.reply({ embeds: [embed] });
	}

	register(): SlashCommandBuilder | Omit<SlashCommandBuilder, "addSubcommandGroup" | "addSubcommand"> {
		// set the name and description shown in discord here (these are necessary)
		// (name: string.length = 1-32, description string.length = 1-100)(the name has to be lowercase!)
		// here you can also add things like options to your command
		// see more under https://discord.js.org/#/docs/builders/stable/class/SlashCommandBuilder
		return new SlashCommandBuilder()
			.setName("user")
			.setDescription("Get information about a user")
			.addUserOption((option) =>
				option.setName("user").setDescription("The user to get information about.").setRequired(true)
			);
	}
}

export default new UserCommand();
