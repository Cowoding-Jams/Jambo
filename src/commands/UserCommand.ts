import { Command } from "../Command";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";

const toUnix = (timestamp: number | Date) => {
	if (timestamp instanceof Date) timestamp = timestamp.getTime();
	return Math.floor(timestamp / 1000);
};

// set the class name, the export at the bottom and the file name to your desired command name (same as the one in the register function)
class CommandName extends Command {
	constructor() {
		super("user"); // the name under which the bot internally stores your command (should be the same as the named set in `register`, must be unique)
	}

	async execute(interaction: CommandInteraction): Promise<void> {
		// put the logic of your command here
		// for example:
		const user = interaction.options.getUser("user");
		if (!user) return interaction.reply("Please provide a user.");
		const member = interaction.guild?.members.cache.get(user.id);
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
		interaction.reply({ embeds: [embed] });
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

export default new CommandName();
